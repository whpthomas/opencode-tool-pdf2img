import { type Plugin, tool } from "@opencode-ai/plugin"
import { pdf } from 'pdf-to-img'
import fs from 'fs/promises'
import path from 'path'
import * as pdfjsLib from 'pdfjs-dist'

// Configure pdf.js to suppress JBIG2 warnings
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.mjs'

// Suppress JBIG2 warnings by overriding console.warn
const originalWarn = console.warn
let warnSuppressed = false
const suppressJBIG2Warnings = () => {
  if (warnSuppressed) return
  warnSuppressed = true
  console.warn = (...args: any[]) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('JBIG2')) {
      return
    }
    originalWarn.apply(console, args)
  }
}

export async function convertPdfToImages(
  pdfPath: string,
  outputDir: string,
  scale: number = 4.0
): Promise<string> {
  if (!pdfPath || typeof pdfPath !== 'string' || pdfPath.trim() === '') {
    return 'Error: No PDF file specified. Please provide a path to a PDF file using the pdfPath parameter.'
  }

  if (pdfPath.includes('\0')) {
    return 'Error: Invalid PDF path contains null character. Please provide a valid file path.'
  }

  const absoluteOutputDir = path.resolve(outputDir)
  const absolutePdfPath = path.resolve(absoluteOutputDir, pdfPath)

  const normalizedInputPath = path.normalize(absolutePdfPath)
  const normalizedOutputDir = path.normalize(absoluteOutputDir)

  if (!normalizedInputPath.startsWith(normalizedOutputDir + path.sep) && normalizedInputPath !== normalizedOutputDir) {
    throw new Error(`Access denied: PDF path must be within the working directory: ${absoluteOutputDir}`)
  }

  try {
    await fs.access(absolutePdfPath)
  } catch {
    throw new Error(`PDF file not found: ${absolutePdfPath}`)
  }

  // Suppress JBIG2 warnings before loading PDF
  suppressJBIG2Warnings()

  let doc

  try {
    doc = await pdf(absolutePdfPath, {
      scale,
      docInitParams: {
        isEvalSupported: false,
        cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/',
        cMapPacked: true,
      }
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('password') || message.includes('Password')) {
      throw new Error('PDF is password-protected. Please provide the password parameter.')
    }
    throw new Error(`Failed to load PDF: ${message}`)
  }

  const pdfDir = path.dirname(absolutePdfPath)

  await fs.mkdir(pdfDir, { recursive: true })

  const totalPages = doc.length
  const files: string[] = []

  for await (const pageBuffer of doc) {
    const pageNum = files.length + 1
    const filename = `page-${pageNum}.png`
    const filePath = path.join(pdfDir, filename)
    await fs.writeFile(filePath, pageBuffer)
    files.push(filename)
  }

  const manifestLines = files.map(f => `- [ ] ${f}`)
  manifestLines.push('')
  manifestLines.push(`Converted ${totalPages} pages to ${pdfDir}/`)

  const manifestContent = manifestLines.join('\n')

  const manifestPath = path.join(pdfDir, 'manifest.txt')
  await fs.writeFile(manifestPath, manifestContent)

  return manifestContent
}

export const plugin: Plugin = async (_ctx) => {
  return {
    tool: {
      pdf2img: tool({
        description:
          'Convert a PDF file into PNG images (one image per page). Creates PNG images named page-1.png, page-2.png, etc. in the same directory as the PDF file. Also generates a manifest.txt file with a checklist of all generated pages for workflow tracking.',
        args: {
          pdfPath: tool.schema.string().describe('Path to the PDF file (absolute or relative to current directory)'),
          scale: tool.schema.number().optional().default(4.0).describe('Rendering scale factor (default: 4.0, approximately 288 DPI)'),
        },
        async execute(args, context) {
          return await convertPdfToImages(
            args.pdfPath,
            context.directory,
            args.scale ?? 4.0,
          );
        },
      }),
    },
  };
};

export { plugin as default };

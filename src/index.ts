import { type Plugin, tool } from "@opencode-ai/plugin"
import { pdf } from 'pdf-to-img'
import fs from 'fs/promises'
import path from 'path'

export async function convertPdfToImages(
  pdfPath: string,
  outputDir: string,
  scale: number = 4.0
): Promise<string> {
  if (!pdfPath || typeof pdfPath !== 'string') {
    throw new Error('Invalid PDF path: path cannot be empty')
  }

  if (pdfPath.includes('\0')) {
    throw new Error('Invalid PDF path: contains null character')
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

  let doc

  try {
    doc = await pdf(absolutePdfPath, {
      scale,
      docInitParams: {
        isEvalSupported: false
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

export const Pdf2imgPlugin: Plugin = async (_ctx) => {
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

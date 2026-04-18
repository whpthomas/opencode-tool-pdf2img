import { tool } from '@opencode-ai/plugin';
import { convertPdfToImages } from 'opencode-tool-pdf2img';

export default tool({
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
});

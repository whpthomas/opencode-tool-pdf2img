# opencode-tool-pdf2img

Custom tool for OpenCode that converts PDF files into images (one image per page) for multi-modal models.

## Installation

Add to your `opencode.json`:

```json
{
  "plugin": ["opencode-tool-pdf2img"]
}
```

OpenCode automatically installs plugin dependencies at runtime.

## Usage

The tool can be called during your conversation:

```
Use the pdf2img tool to convert a PDF file into PNG images.
```

### Arguments

- `pdfPath` (string, required): Path to the PDF file (absolute or relative to current directory)
- `scale` (number, optional): Rendering scale factor (default: 4.0, approximately 288 DPI)

## Output

- Creates `page-1.png`, `page-2.png`, etc. in the same directory as the source PDF
- Generates a `manifest.txt` file with a checklist of all generated pages

## Development

```bash
# Install dependencies
bun install

# Build
npm run build
```

## License

MIT

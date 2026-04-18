# opencode-tool-pdf2img

Custom tool for OpenCode that converts PDF files into images (one image per page) for multi-modal models.

## Installation

### Option 1: Project-level (recommended)

Add to your project's `.opencode/package.json`:

```json
{
  "dependencies": {
    "@opencode-ai/plugin": "^1.4.0",
    "opencode-tool-pdf2img": "latest"
  }
}
```

### Option 2: Global (available in all projects)

Add to `~/.config/opencode/package.json`:

```json
{
  "dependencies": {
    "@opencode-ai/plugin": "^1.4.0",
    "opencode-tool-pdf2img": "latest"
  }
}
```

OpenCode automatically installs dependencies and sets up the tool.

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

## Authors

- [@whpthomas](https://github.com/whpthomas) - Concept, logic and troubleshooting
- Qwen3.5 122B A10B int4 AutoRound ~ DGX Spark - Research and coding

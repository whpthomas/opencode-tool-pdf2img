# opencode-tool-pdf2img

Custom tool for OpenCode that converts PDF files into images (one image per page) for multi-modal models. Updated to work with new [Orca2](https://www.npmjs.com/package/opencode-plugin-orca2) file structure.

## Installation

### Option 1: Project-level (recommended)

Add to your project's `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-tool-pdf2img"]
}
```

### Option 2: Global (available in all projects)

Add to `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-tool-pdf2img"]
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

- Creates `page-1.png`, `page-2.png`, etc. in the `pdr2img` sub-directory below the source PDF

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

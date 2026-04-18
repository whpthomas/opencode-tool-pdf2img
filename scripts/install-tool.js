import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = dirname(__dirname);

// Read the tool wrapper from the package
const toolWrapperPath = join(packageRoot, '..', 'tools', 'pdf2img.ts');
const toolWrapper = readFileSync(toolWrapperPath, 'utf-8');

// Try to install in project-level .opencode
const projectOpencode = join(process.cwd(), '.opencode');
const projectTools = join(projectOpencode, 'tools');

if (existsSync(projectOpencode)) {
  if (!existsSync(projectTools)) {
    mkdirSync(projectTools, { recursive: true });
  }
  
  const toolPath = join(projectTools, 'pdf2img.ts');
  writeFileSync(toolPath, toolWrapper);
  console.log('✓ pdf2img tool installed to .opencode/tools/pdf2img.ts');
} else {
  // Try global config location
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  if (homeDir) {
    const globalOpencode = join(homeDir, '.config', 'opencode');
    const globalTools = join(globalOpencode, 'tools');
    
    if (!existsSync(globalTools)) {
      mkdirSync(globalTools, { recursive: true });
    }
    
    const toolPath = join(globalTools, 'pdf2img.ts');
    writeFileSync(toolPath, toolWrapper);
    console.log('✓ pdf2img tool installed to ~/.config/opencode/tools/pdf2img.ts');
  } else {
    console.log('⚠ Could not find .opencode directory. Tool not installed.');
  }
}

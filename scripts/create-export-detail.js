const fs = require('fs').promises;
const path = require('path');

async function main() {
  const cwd = process.cwd();
  const outDirectory = path.join(cwd, 'apps', 'web', 'out');
  const exportDetailPath = path.join(cwd, 'apps', 'web', '.next', 'export-detail.json');

  const content = {
    version: 1,
    success: true,
    outDirectory,
  };

  try {
    await fs.mkdir(path.dirname(exportDetailPath), { recursive: true });
  } catch {
    // ignore mkdir errors; writeFile will surface real problems
  }

  try {
    await fs.writeFile(exportDetailPath, JSON.stringify(content));
    console.log(`Created ${exportDetailPath}`);
  } catch (error) {
    console.error('Failed to create export-detail.json', error);
    process.exit(1);
  }
}

main();



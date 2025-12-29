const fs = require('fs').promises;
const path = require('path');

async function main() {
  const cwd = process.cwd();

  // Support running from monorepo root OR from apps/web
  const webRoot = cwd.endsWith(path.join('apps', 'web'))
    ? cwd
    : path.join(cwd, 'apps', 'web');

  const exportDetailPath = path.join(webRoot, '.next', 'export-detail.json');

  const content = {
    // Match the shape Vercel expects but mark export as unsuccessful so the
    // platform doesn't treat this as a real `next export` output.
    version: 1,
    success: false,
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



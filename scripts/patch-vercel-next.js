const fs = require('fs');
const path = require('path');

function patchFile({ filePath }) {
  const original = fs.readFileSync(filePath, 'utf8');

  // Patch @vercel/next export detection:
  // - Today it treats the presence of `.next/export-detail.json` as "this is a `next export`"
  // - But Vercel CLI also tries to stat that file during packaging for non-export Next builds
  // - We only want to enter the `next export` branch when export-marker.json indicates
  //   `hasExportPathMap: true` (i.e. user actually intended `next export`)
  const needle = [
    '  const userExport = await getExportStatus(entryPath);',
    '  if (userExport) {',
    '    const exportIntent = await getExportIntent(entryPath);',
  ].join('\n');

  if (!original.includes(needle)) return { didPatch: false };

  const replacement = [
    '  const exportIntent = await getExportIntent(entryPath);',
    '  const userExport = await getExportStatus(entryPath);',
    '  if (userExport && exportIntent) {',
  ].join('\n');

  const patched = original.replace(needle, replacement);
  if (patched === original) return { didPatch: false };

  fs.writeFileSync(filePath, patched, 'utf8');
  return { didPatch: true };
}

function main() {
  const candidatePaths = [
    path.join(process.cwd(), 'node_modules', '@vercel', 'next', 'dist', 'index.js'),
  ];

  const targetPath = candidatePaths.find((p) => fs.existsSync(p));
  if (!targetPath) {
    console.log('patch-vercel-next: @vercel/next not installed; skipping');
    return;
  }

  const { didPatch } = patchFile({ filePath: targetPath });
  console.log(`patch-vercel-next: ${didPatch ? 'patched' : 'no change'} (${targetPath})`);
}

main();



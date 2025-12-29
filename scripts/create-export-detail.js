const fs = require('fs').promises;
const path = require('path');

async function main() {
  // This file is a workaround for a Vercel CLI packaging issue when using local/prebuilt builds.
  // When building *on Vercel* (Git integration / Vercel build machines), creating this file
  // causes the Next.js builder to treat the app as a `next export` and fail for dynamic apps.
  // Note: `vercel build` in CI also sets `VERCEL=1`, so we only skip on actual Vercel *Git*
  // build machines (where `GITHUB_ACTIONS` is not set).
  if (process.env.VERCEL === '1' && process.env.GITHUB_ACTIONS !== 'true') {
    console.log('Skipping export-detail.json generation on Vercel build environment');
    return;
  }

  const cwd = process.cwd();

  // Support running from monorepo root OR from apps/web
  const webRoot = cwd.endsWith(path.join('apps', 'web'))
    ? cwd
    : path.join(cwd, 'apps', 'web');

  const exportDetailPath = path.join(webRoot, '.next', 'export-detail.json');
  const export404Path = path.join(webRoot, '.next', 'export', '404.html');

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

  // Some Vercel CLI / builder paths attempt to stat export artifacts under
  // `.next/export/*` even for non-export Next.js apps. Provide a minimal file
  // so the build can proceed (the app is still deployed as dynamic/SSR).
  try {
    await fs.mkdir(path.dirname(export404Path), { recursive: true });
    await fs.writeFile(export404Path, '<!doctype html><html><head><meta charset="utf-8"><title>404</title></head><body>Not Found</body></html>');
    console.log(`Created ${export404Path}`);
  } catch (error) {
    console.error('Failed to create .next/export/404.html', error);
    process.exit(1);
  }
}

main();



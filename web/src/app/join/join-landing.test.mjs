import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';

import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const pagePath = fileURLToPath(new URL('./[code]/page.tsx', import.meta.url));
const joinLandingPath = fileURLToPath(new URL('./join-landing.mjs', import.meta.url));

test('shows the code and the app scheme', async () => {
  const source = readFileSync(pagePath, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: 'page.tsx',
  });
  const dir = mkdtempSync(join(fileURLToPath(new URL('../../..', import.meta.url)), '.page-proof-'));
  const stubPath = join(dir, 'link-stub.mjs');
  const pageModulePath = join(dir, 'page.mjs');
  writeFileSync(
    stubPath,
    "import { jsx } from 'react/jsx-runtime';\nexport default function Link({ href, children, className }) {\n  return jsx('a', { href, className, children });\n}\n",
  );
  writeFileSync(
    pageModulePath,
    outputText
      .replace("from 'next/link'", `from ${JSON.stringify(pathToFileURL(stubPath).href)}`)
      .replace("from '../join-landing.mjs'", `from ${JSON.stringify(pathToFileURL(joinLandingPath).href)}`),
  );

  try {
    const { default: JoinPage } = await import(pathToFileURL(pageModulePath).href);
    const element = await JoinPage({ params: Promise.resolve({ code: 'ab12cd' }) });
    const html = renderToStaticMarkup(element);

    assert.match(html, />AB12CD</);
    assert.match(html, /href="projectours:\/\/join\/AB12CD"/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

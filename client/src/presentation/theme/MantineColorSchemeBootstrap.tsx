/* eslint-disable @next/next/no-sync-scripts -- blocking external bootstrap in server HTML only (useServerInsertedHTML); async would FOUC theme. */
'use client';

import { useServerInsertedHTML } from 'next/navigation';

const SCRIPT_ID = 'mantine-color-scheme-bootstrap';
const SCRIPT_SRC = '/mantine-color-scheme-bootstrap.js';

export function MantineColorSchemeBootstrap() {
  useServerInsertedHTML(() => <script key={SCRIPT_ID} id={SCRIPT_ID} src={SCRIPT_SRC} />);
  return null;
}

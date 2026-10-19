import assert from 'node:assert/strict';
import test from 'node:test';

import { joinLanding } from './join-landing.mjs';

test('shows the code and the app scheme', () => {
  const view = joinLanding('ab12cd');

  assert.equal(view.inviteCode, 'AB12CD');
  assert.equal(view.href, 'projectours://join/AB12CD');
});

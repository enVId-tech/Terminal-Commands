import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createValidator, render, shellQuote } from '../CLI/template.ts';

test('render substitutes answers without HTML-escaping shell syntax', () => {
  assert.equal(render('echo "{{msg}}" && ls', { msg: 'a & b' }), 'echo "a & b" && ls');
});

test('render supports eq, includes, and, or and not helpers', () => {
  const answers = { env: 'prod', tests: ['unit', 'e2e'], flag: true };
  assert.equal(render("{{#if (eq env 'prod')}}yes{{else}}no{{/if}}", answers), 'yes');
  assert.equal(render("{{#if (includes tests 'unit')}}unit{{/if}}", answers), 'unit');
  assert.equal(render("{{#if (includes tests 'lint')}}lint{{else}}none{{/if}}", answers), 'none');
  assert.equal(render("{{#if (and flag (not (eq env 'dev')))}}ok{{/if}}", answers), 'ok');
  assert.equal(render("{{#if (or (eq env 'dev') (eq env 'prod'))}}ok{{/if}}", answers), 'ok');
});

test('render returns an empty string when a template renders to nothing', () => {
  assert.equal(render('{{#if no}}x{{/if}}', {}), '');
});

test('shellQuote keeps a value as one literal argument', () => {
  assert.equal(shellQuote("it's", 'linux'), `'it'\\''s'`);
  assert.equal(shellQuote('a "b"', 'win32'), '"a ""b"""');
  assert.equal(shellQuote('a\0b\nc', 'win32'), '"ab c"');
  assert.equal(shellQuote('a\0b', 'linux'), `'ab'`);
  assert.equal(render('echo {{quote name}}', { name: '$(rm -rf ~)' }), process.platform === 'win32' ? 'echo "$(rm -rf ~)"' : "echo '$(rm -rf ~)'");
});

test('createValidator evaluates validators written in the config', () => {
  const validate = createValidator("input => !input.includes(' ') || 'No spaces'");
  assert.equal(validate('main', {}), true);
  assert.equal(validate('a b', {}), 'No spaces');
});

test('createValidator reports errors thrown by the validator instead of crashing', () => {
  const validate = createValidator('input => input.nope.deep');
  assert.match(String(validate('x', {})), /Validator failed/);
});

test('createValidator isolates execution from Node globals and blocks eval/infinite loops', () => {
  const probeProcess = createValidator("() => typeof process === 'undefined' || 'leaked'");
  assert.equal(probeProcess('x', {}), true);

  const escapeAttempt = createValidator("(_i, a) => { const f = a.constructor.constructor('return process'); return typeof f() === 'undefined'; }");
  assert.match(String(escapeAttempt('x', {})), /Validator failed/);

  const infiniteLoop = createValidator('() => { while (true) {} }');
  assert.match(String(infiniteLoop('x', {})), /Validator failed/);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ConfigError, discoverConfigFiles, parseConfig } from '../CLI/config.ts';

test('parseConfig reads YAML and JSON', () => {
  const yaml = parseConfig('commands:\n  - name: Build\n    executeCommands: [npm run build]\n', '.yaml');
  const json = parseConfig('{"commands":[{"name":"Build","executeCommands":["npm run build"]}]}', '.json');
  assert.deepEqual(yaml, json);
});

test('parseConfig rejects configs without a commands list', () => {
  assert.throws(() => parseConfig('{}', '.json'), ConfigError);
});

test('parseConfig names the broken nested subcommand', () => {
  const text = JSON.stringify({ commands: [{ name: 'Docker', subcommands: [{ description: 'no name' }] }] });
  assert.throws(() => parseConfig(text, '.json'), /Command #1 > subcommand #1 needs a "name"/);
});

test('parseConfig rejects unsupported extensions and invalid syntax', () => {
  assert.throws(() => parseConfig('x', '.txt'), /Unsupported file type/);
  assert.throws(() => parseConfig('{nope', '.json'), /Could not parse/);
});

test('discoverConfigFiles finds ./commands.* and everything in ./data', () => {
  const dir = mkdtempSync(join(tmpdir(), 'tc-test-'));
  try {
    mkdirSync(join(dir, 'data'));
    writeFileSync(join(dir, 'commands.yaml'), 'commands: []');
    writeFileSync(join(dir, 'other.yaml'), 'commands: []');
    writeFileSync(join(dir, 'data', 'a.json'), '{}');
    writeFileSync(join(dir, 'data', 'notes.txt'), '');
    assert.deepEqual(discoverConfigFiles(dir), [join(dir, 'commands.yaml'), join(dir, 'data', 'a.json')]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

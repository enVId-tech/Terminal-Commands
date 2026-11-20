import { test } from 'node:test';
import assert from 'node:assert/strict';
import { configFilename, formatFromFilename, parseConfig, serializeConfig } from '../app/lib/config-io.ts';
import { exampleConfig } from '../app/lib/example.ts';
import { render } from '../CLI/template.ts';
import { validateConfig } from '../CLI/config.ts';

test('formatFromFilename recognises config files', () => {
  assert.equal(formatFromFilename('Commands.YML'), 'yaml');
  assert.equal(formatFromFilename('x.yaml'), 'yaml');
  assert.equal(formatFromFilename('x.json'), 'json');
  assert.equal(formatFromFilename('x.txt'), null);
});

test('serializeConfig and parseConfig round-trip in both formats', () => {
  for (const format of ['json', 'yaml'] as const) {
    assert.deepEqual(parseConfig(serializeConfig(exampleConfig, format), format), exampleConfig);
  }
  assert.equal(configFilename('yaml'), 'commands.yaml');
});

test('parseConfig explains what is wrong', () => {
  assert.throws(() => parseConfig('{"nope":1}', 'json'), /"commands" list/);
  assert.throws(() => parseConfig('commands: [', 'yaml'));
});

test('the example config is valid and every template renders with sample answers', () => {
  const config = validateConfig(structuredClone(exampleConfig));
  const answers = { buildType: 'production', minify: true, testTypes: ['unit', 'e2e'], dbOperation: 'seed', dbName: 'app' };
  const walk = (nodes: typeof config.commands) => {
    for (const node of nodes) {
      for (const template of [...(node.executeCommands ?? []), ...(node.postExecuteCommands ?? [])]) {
        assert.doesNotMatch(render(template, answers), /\{\{|\}\}/, `${node.name}: ${template}`);
      }
      walk(node.subcommands ?? []);
    }
  };
  walk(config.commands);
  assert.equal(render(exampleConfig.commands[2].executeCommands![0], answers), 'npm run test:unit');
  assert.equal(render(exampleConfig.commands[2].executeCommands![1], answers), '');
});

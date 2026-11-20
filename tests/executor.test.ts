import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectCommands, toQuestion } from '../CLI/executor.ts';
import { runShell, runShellCommands, runSource } from '../CLI/runner.ts';

const real = { dryRun: false };

async function captureStdout(fn: () => Promise<void>): Promise<string> {
  const original = console.log;
  const lines: string[] = [];
  console.log = (...args: unknown[]) => void lines.push(args.join(' '));
  try {
    await fn();
  } finally {
    console.log = original;
  }
  return lines.join('\n');
}

test('collectCommands prefers executeCommands, then execute', () => {
  assert.deepEqual(collectCommands({ name: 'a', executeCommands: ['x', 'y'], execute: 'z' }, {}), ['x', 'y']);
  assert.deepEqual(collectCommands({ name: 'a', execute: 'z' }, {}), ['z']);
  assert.deepEqual(collectCommands({ name: 'a' }, {}), []);
});

test('collectCommands maps the first option answer to a command', () => {
  const node = {
    name: 'db',
    options: [{ type: 'list' as const, name: 'op', message: 'op?' }],
    execute: { migrate: 'run migrate', seed: 'run seed' },
  };
  assert.deepEqual(collectCommands(node, { op: 'seed' }), ['run seed']);
});

test('runShell returns the exit code of the command', async () => {
  await captureStdout(async () => {
    assert.equal(await runShell('node -e "process.exit(0)"', real), 0);
  });
  const original = console.error;
  console.error = () => {};
  try {
    assert.equal(await runShell('node -e "process.exit(3)"', real), 3);
  } finally {
    console.error = original;
  }
});

test('dry runs print commands without running them', async () => {
  const out = await captureStdout(async () => {
    assert.equal(await runShell('node -e "process.exit(9)"', { dryRun: true }), 0);
    await runSource('console.log(1)', 'javascript', { dryRun: true });
  });
  assert.match(out, /process\.exit\(9\)/);
  assert.match(out, /\[javascript\]/);
});

test('runShellCommands runs sequentially in order and in parallel concurrently', async () => {
  const sleep = (ms: number, label: string) => `node -e "setTimeout(()=>console.log('${label}'),${ms})"`;
  let start = Date.now();
  await captureStdout(() => runShellCommands([sleep(300, 'a'), sleep(300, 'b')], true, real));
  const parallel = Date.now() - start;
  start = Date.now();
  await captureStdout(() => runShellCommands([sleep(300, 'a'), sleep(300, 'b')], false, real));
  const sequential = Date.now() - start;
  assert.ok(sequential > parallel + 150, `sequential ${sequential}ms should be slower than parallel ${parallel}ms`);
});

test('runSource executes JavaScript and TypeScript snippets', async () => {
  const sources: Record<string, string> = {
    javascript: 'const n = 2;',
    typescript: 'const n: number = 2;',
  };
  for (const [language, source] of Object.entries(sources)) {
    const out = await captureStdout(() => runSource(source, language, real));
    assert.match(out, /\$ node/, `${language} snippet should run through node`);
  }
});

test('toQuestion maps the legacy "list" type to inquirer\'s "select"', () => {
  const question = toQuestion({ type: 'list', name: 'env', message: 'Env?', choices: ['dev', 'prod'] });
  assert.equal(question.type, 'select');
  assert.deepEqual(question.choices, ['dev', 'prod']);
  assert.equal(toQuestion({ type: 'checkbox', name: 'x', message: 'x' }).type, 'checkbox');
});

test('toQuestion compiles string validators', () => {
  const question = toQuestion({ type: 'input', name: 'n', message: 'n', validate: "v => v.length > 2 || 'too short'" });
  const validate = question.validate as (input: string, answers: object) => unknown;
  assert.equal(validate('abc', {}), true);
  assert.equal(validate('a', {}), 'too short');
});

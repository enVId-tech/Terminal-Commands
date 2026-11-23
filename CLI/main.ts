#!/usr/bin/env node
import { parseArgs } from 'node:util';
import * as path from 'node:path';
import pkg from '../package.json' with { type: 'json' };
import type { CommandNode } from '../app/types/commands.ts';
import { ConfigError, discoverConfigFiles, loadConfig } from './config.ts';
import { choose, executeNode } from './executor.ts';
import { hasActiveChild } from './runner.ts';

const HELP = `terminal-commands ${pkg.version}

Run the command workflows you built at https://commands.etran.dev.

Usage
  terminal-commands [config-file] [options]

Options
  -c, --config <file>   JSON or YAML configuration (default: ./commands.* or ./data/*)
  -l, --list            Print the command tree and exit
  -n, --dry-run         Show the commands that would run without running them
  -h, --help            Show this help
  -v, --version         Show the version

The configuration path can also be set with TERMINAL_COMMANDS_CONFIG.`;

function printTree(nodes: CommandNode[], depth = 0) {
  for (const node of nodes) {
    console.log(`${'  '.repeat(depth)}${depth ? '- ' : ''}${node.name}${node.description ? `  (${node.description})` : ''}`);
    if (node.subcommands) printTree(node.subcommands, depth + 1);
  }
}

async function pickConfigFile(explicit?: string): Promise<string> {
  const requested = explicit ?? process.env.TERMINAL_COMMANDS_CONFIG;
  if (requested) return path.resolve(requested);

  const files = discoverConfigFiles();
  if (files.length === 0) {
    throw new ConfigError('No configuration found. Pass one with --config, or put commands.yaml in this folder or in ./data.');
  }
  if (files.length === 1) return files[0];
  const file = await choose(
    'Select a configuration file:',
    files.map((f) => path.relative(process.cwd(), f)),
  );
  return path.resolve(file);
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      config: { type: 'string', short: 'c' },
      list: { type: 'boolean', short: 'l' },
      'dry-run': { type: 'boolean', short: 'n' },
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
    },
  });

  if (values.help) return void console.log(HELP);
  if (values.version) return void console.log(pkg.version);

  const config = loadConfig(await pickConfigFile(values.config ?? positionals[0]));
  if (config.commands.length === 0) return void console.log('No commands are defined in this configuration.');
  if (values.list) return printTree(config.commands);

  const name = await choose('What do you want to run?', config.commands.map((command) => command.name));
  const selected = config.commands.find((command) => command.name === name);
  if (selected) await executeNode(selected, {}, { dryRun: !!values['dry-run'] });
}

// Ctrl+C: while a command runs it gets the signal and the CLI keeps waiting for it; otherwise exit.
process.on('SIGINT', () => {
  if (hasActiveChild()) return;
  console.log('\nCancelled.');
  process.exit(130);
});

main().catch((error: unknown) => {
  if (error instanceof Error && error.name === 'ExitPromptError') {
    console.log('\nCancelled.');
    process.exit(130);
  }
  console.error(error instanceof ConfigError ? error.message : error);
  process.exit(1);
});

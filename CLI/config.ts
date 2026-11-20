import * as fs from 'node:fs';
import * as path from 'node:path';
import yaml from 'js-yaml';
import type { CommandConfig, CommandNode } from '../app/types/commands.ts';

const CONFIG_EXTENSIONS = new Set(['.json', '.yml', '.yaml']);

export class ConfigError extends Error {}

export function parseConfig(text: string, extension: string): CommandConfig {
  const ext = extension.toLowerCase();
  let data: unknown;
  try {
    if (ext === '.json') data = JSON.parse(text);
    else if (ext === '.yml' || ext === '.yaml') data = yaml.load(text);
    else throw new ConfigError(`Unsupported file type "${extension}". Use .json, .yml or .yaml.`);
  } catch (error) {
    if (error instanceof ConfigError) throw error;
    throw new ConfigError(`Could not parse the configuration: ${(error as Error).message}`);
  }
  return validateConfig(data);
}

export function loadConfig(file: string): CommandConfig {
  let text: string;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (error) {
    throw new ConfigError(`Could not read ${file}: ${(error as Error).message}`);
  }
  return parseConfig(text, path.extname(file));
}

function validateNode(node: unknown, where: string): asserts node is CommandNode {
  if (!node || typeof node !== 'object') throw new ConfigError(`${where} must be an object.`);
  const { name, subcommands, executeCommands, options } = node as CommandNode;
  if (typeof name !== 'string' || !name.trim()) throw new ConfigError(`${where} needs a "name".`);
  if (executeCommands !== undefined && !Array.isArray(executeCommands)) {
    throw new ConfigError(`${where} ("${name}"): "executeCommands" must be a list.`);
  }
  if (options !== undefined && !Array.isArray(options)) {
    throw new ConfigError(`${where} ("${name}"): "options" must be a list.`);
  }
  if (subcommands !== undefined) {
    if (!Array.isArray(subcommands)) throw new ConfigError(`${where} ("${name}"): "subcommands" must be a list.`);
    subcommands.forEach((sub, i) => validateNode(sub, `${where} > subcommand #${i + 1}`));
  }
}

export function validateConfig(data: unknown): CommandConfig {
  if (!data || typeof data !== 'object' || !Array.isArray((data as CommandConfig).commands)) {
    throw new ConfigError('The configuration needs a top-level "commands" list.');
  }
  const config = data as CommandConfig;
  config.commands.forEach((cmd, i) => validateNode(cmd, `Command #${i + 1}`));
  return config;
}

/** Config files that sit next to the user: `./commands.*` and everything in `./data`. */
export function discoverConfigFiles(cwd: string = process.cwd()): string[] {
  const found: string[] = [];
  const scan = (dir: string, only?: (name: string) => boolean) => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!CONFIG_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;
      if (only && !only(entry.name)) continue;
      found.push(path.join(dir, entry.name));
    }
  };
  scan(cwd, (name) => /^commands\.(json|ya?ml)$/i.test(name));
  scan(path.join(cwd, 'data'));
  return found.sort();
}

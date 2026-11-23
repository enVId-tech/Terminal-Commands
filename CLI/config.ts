import * as fs from 'node:fs';
import * as path from 'node:path';
import { load as loadYaml } from 'js-yaml';
import type { CommandConfig } from '../app/types/commands.ts';
import { validateCommandConfig } from '../app/lib/validate-config.ts';

const CONFIG_EXTENSIONS = new Set(['.json', '.yml', '.yaml']);
const YAML_LOAD_OPTIONS = { maxAliases: 50, maxDepth: 64 } as const;

export class ConfigError extends Error {}

export function parseConfig(text: string, extension: string): CommandConfig {
  const ext = extension.toLowerCase();
  let data: unknown;
  try {
    if (ext === '.json') data = JSON.parse(text);
    else if (ext === '.yml' || ext === '.yaml') data = loadYaml(text, YAML_LOAD_OPTIONS);
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

export function validateConfig(data: unknown): CommandConfig {
  return validateCommandConfig(data, { allowEmptyNames: false }, (msg) => new ConfigError(msg));
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

import { dump as dumpYaml, load as loadYaml } from 'js-yaml';
import type { CommandConfig } from '../types/commands';
import { validateCommandConfig } from './validate-config.ts';

export type ConfigFormat = 'json' | 'yaml';

const YAML_LOAD_OPTIONS = { maxAliases: 50, maxDepth: 64 } as const;

export const formatFromFilename = (name: string): ConfigFormat | null => {
  const lower = name.toLowerCase();
  if (lower.endsWith('.json')) return 'json';
  if (lower.endsWith('.yaml') || lower.endsWith('.yml')) return 'yaml';
  return null;
};

export const serializeConfig = (config: CommandConfig, format: ConfigFormat): string =>
  format === 'json' ? JSON.stringify(config, null, 2) : dumpYaml(config, { lineWidth: 100, noRefs: true });

/** Parse and check a config. Throws an Error with a readable message when it is not usable. */
export function parseConfig(text: string, format: ConfigFormat): CommandConfig {
  const data: unknown = format === 'json' ? JSON.parse(text) : loadYaml(text, YAML_LOAD_OPTIONS);
  return validateCommandConfig(data, { allowEmptyNames: true });
}

export const configFilename = (format: ConfigFormat): string => `commands.${format === 'json' ? 'json' : 'yaml'}`;

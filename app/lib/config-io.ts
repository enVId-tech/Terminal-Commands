import yaml from 'js-yaml';
import type { CommandConfig } from '../types/commands';

export type ConfigFormat = 'json' | 'yaml';

export const formatFromFilename = (name: string): ConfigFormat | null => {
  const lower = name.toLowerCase();
  if (lower.endsWith('.json')) return 'json';
  if (lower.endsWith('.yaml') || lower.endsWith('.yml')) return 'yaml';
  return null;
};

export const serializeConfig = (config: CommandConfig, format: ConfigFormat): string =>
  format === 'json' ? JSON.stringify(config, null, 2) : yaml.dump(config, { lineWidth: 100, noRefs: true });

/** Parse and check a config. Throws an Error with a readable message when it is not usable. */
export function parseConfig(text: string, format: ConfigFormat): CommandConfig {
  const data: unknown = format === 'json' ? JSON.parse(text) : yaml.load(text);
  if (!data || typeof data !== 'object' || !Array.isArray((data as CommandConfig).commands)) {
    throw new Error('The file needs a top-level "commands" list.');
  }
  return data as CommandConfig;
}

export const configFilename = (format: ConfigFormat): string => `commands.${format === 'json' ? 'json' : 'yaml'}`;

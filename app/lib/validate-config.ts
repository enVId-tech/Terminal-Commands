import type { CommandConfig, CommandNode, CommandOption } from '../types/commands.ts';

const MAX_DEPTH = 64;
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const OPTION_TYPES = new Set<CommandOption['type']>([
  'input',
  'list',
  'confirm',
  'password',
  'editor',
  'checkbox',
  'number',
]);

export interface ValidationOptions {
  allowEmptyNames?: boolean;
}

type MakeError = (message: string) => Error;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  for (const key of Object.getOwnPropertyNames(value)) {
    if (DANGEROUS_KEYS.has(key)) return false;
  }
  return true;
}

function assertStringArray(value: unknown, label: string, makeError: MakeError): void {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw makeError(`${label} must be a list of strings.`);
  }
}

function validateOption(option: unknown, where: string, options: ValidationOptions, makeError: MakeError): void {
  if (!isPlainObject(option)) throw makeError(`${where} must be an object.`);

  const { type, name, message, choices, validate, default: defaultValue } = option;
  if (typeof type !== 'string' || !OPTION_TYPES.has(type as CommandOption['type'])) {
    throw makeError(`${where} has an unsupported option type.`);
  }
  if (typeof name !== 'string' || (!options.allowEmptyNames && !name.trim())) {
    throw makeError(`${where} needs a "name".`);
  }
  if (DANGEROUS_KEYS.has(name)) {
    throw makeError(`${where} uses a reserved option name "${name}".`);
  }
  if (typeof message !== 'string') {
    throw makeError(`${where} ("${name}"): "message" must be a string.`);
  }
  if (choices !== undefined) {
    assertStringArray(choices, `${where} ("${name}"): "choices"`, makeError);
  }
  if (validate !== undefined && typeof validate !== 'string') {
    throw makeError(`${where} ("${name}"): "validate" must be a string.`);
  }
  if (
    defaultValue !== undefined &&
    typeof defaultValue !== 'string' &&
    typeof defaultValue !== 'boolean' &&
    typeof defaultValue !== 'number'
  ) {
    throw makeError(`${where} ("${name}"): "default" must be a string, boolean, or number.`);
  }
}

function validateNode(
  node: unknown,
  where: string,
  depth: number,
  options: ValidationOptions,
  makeError: MakeError,
): asserts node is CommandNode {
  if (depth > MAX_DEPTH) throw makeError(`Configuration exceeds maximum nesting depth of ${MAX_DEPTH}.`);
  if (!isPlainObject(node)) throw makeError(`${where} must be an object.`);

  const {
    name,
    description,
    options: nodeOptions,
    execute,
    executeCommands,
    executeParallel,
    requireExecutionChoice,
    language,
    subcommands,
    postExecute,
    postExecuteCommands,
    postExecuteParallel,
  } = node;

  if (typeof name !== 'string' || (!options.allowEmptyNames && !name.trim())) {
    throw makeError(`${where} needs a "name".`);
  }
  const label = `${where} ("${name}")`;

  if (description !== undefined && typeof description !== 'string') {
    throw makeError(`${label}: "description" must be a string.`);
  }
  if (language !== undefined && typeof language !== 'string') {
    throw makeError(`${label}: "language" must be a string.`);
  }
  if (executeParallel !== undefined && typeof executeParallel !== 'boolean') {
    throw makeError(`${label}: "executeParallel" must be a boolean.`);
  }
  if (requireExecutionChoice !== undefined && typeof requireExecutionChoice !== 'boolean') {
    throw makeError(`${label}: "requireExecutionChoice" must be a boolean.`);
  }
  if (postExecuteParallel !== undefined && typeof postExecuteParallel !== 'boolean') {
    throw makeError(`${label}: "postExecuteParallel" must be a boolean.`);
  }
  if (postExecute !== undefined && typeof postExecute !== 'string') {
    throw makeError(`${label}: "postExecute" must be a string.`);
  }

  if (execute !== undefined) {
    if (typeof execute !== 'string') {
      if (!isPlainObject(execute) || Object.values(execute).some((v) => typeof v !== 'string')) {
        throw makeError(`${label}: "execute" must be a string or a map of strings.`);
      }
    }
  }
  if (executeCommands !== undefined) {
    assertStringArray(executeCommands, `${label}: "executeCommands"`, makeError);
  }
  if (postExecuteCommands !== undefined) {
    assertStringArray(postExecuteCommands, `${label}: "postExecuteCommands"`, makeError);
  }
  if (nodeOptions !== undefined) {
    if (!Array.isArray(nodeOptions)) throw makeError(`${label}: "options" must be a list.`);
    nodeOptions.forEach((opt, i) => validateOption(opt, `${label} > option #${i + 1}`, options, makeError));
  }
  if (subcommands !== undefined) {
    if (!Array.isArray(subcommands)) throw makeError(`${label}: "subcommands" must be a list.`);
    subcommands.forEach((sub, i) =>
      validateNode(sub, `${where} > subcommand #${i + 1}`, depth + 1, options, makeError),
    );
  }
}

/** Validate a parsed command configuration object and reject unsafe or malformed shapes. */
export function validateCommandConfig(
  data: unknown,
  options: ValidationOptions = {},
  makeError: MakeError = (msg) => new Error(msg),
): CommandConfig {
  if (!isPlainObject(data) || !Array.isArray(data.commands)) {
    throw makeError('The configuration needs a top-level "commands" list.');
  }
  data.commands.forEach((cmd, i) => validateNode(cmd, `Command #${i + 1}`, 0, options, makeError));
  return data as unknown as CommandConfig;
}

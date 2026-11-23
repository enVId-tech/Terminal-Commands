import * as vm from 'node:vm';
import Handlebars from 'handlebars';

export type Answers = Record<string, unknown>;

const MAX_TEMPLATE_CACHE = 500;
const VALIDATOR_TIMEOUT_MS = 1000;

const hbs = Handlebars.create();

hbs.registerHelper('eq', (a: unknown, b: unknown) => a === b);
hbs.registerHelper('ne', (a: unknown, b: unknown) => a !== b);
hbs.registerHelper('not', (value: unknown) => !value);
hbs.registerHelper('and', (...args: unknown[]) => args.slice(0, -1).every(Boolean));
hbs.registerHelper('or', (...args: unknown[]) => args.slice(0, -1).some(Boolean));
hbs.registerHelper('includes', (collection: unknown, value: unknown) =>
  (Array.isArray(collection) || typeof collection === 'string') &&
  (collection as { includes(v: unknown): boolean }).includes(value));
hbs.registerHelper('quote', (value: unknown) => shellQuote(String(value ?? '')));

/** Quote a value so a shell treats it as a single literal argument. */
export function shellQuote(value: string, platform: NodeJS.Platform = process.platform): string {
  const clean = value.replace(/\0/g, '');
  if (platform === 'win32') return `"${clean.replace(/[\r\n]+/g, ' ').replace(/"/g, '""')}"`;
  return `'${clean.replace(/'/g, `'\\''`)}'`;
}

const compiled = new Map<string, Handlebars.TemplateDelegate>();

/**
 * Render a command template with the user's answers.
 *
 * HTML escaping is disabled on purpose: these are shell commands, so turning
 * `&&` into `&amp;&amp;` or `"` into `&quot;` would break them. Use the
 * `quote` helper (`{{quote name}}`) for values that must stay a single argument.
 */
export function render(template: string, answers: Answers = {}): string {
  let fn = compiled.get(template);
  if (!fn) {
    if (compiled.size >= MAX_TEMPLATE_CACHE) compiled.clear();
    fn = hbs.compile(template, { noEscape: true });
    compiled.set(template, fn);
  }
  return fn(answers).trim();
}

export type Validator = (input: unknown, answers: Answers) => boolean | string;

/** Serialize a value into a fresh VM-realm copy so host prototypes never cross into the sandbox. */
function toVmValue(value: unknown, vmParse: (json: string) => unknown): unknown {
  if (value === undefined || typeof value === 'boolean' || typeof value === 'string') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  try {
    return vmParse(JSON.stringify(value));
  } catch {
    return undefined;
  }
}

/**
 * Turn a validator written in the config file (`"input => input.length > 0"`)
 * into a function executed inside an isolated VM context without access to Node
 * globals or host prototypes.
 */
export function createValidator(source: string): Validator {
  // Validate syntax up front so malformed expressions fail early, matching prior behavior.
  const fnScript = new vm.Script(`"use strict"; (${source})`, { filename: 'validator.js' });

  return (input, answers) => {
    try {
      const ctx = vm.createContext(Object.create(null), {
        codeGeneration: { strings: false, wasm: false },
      });
      const vmParse = vm.runInContext('JSON.parse', ctx, { timeout: VALIDATOR_TIMEOUT_MS }) as (json: string) => unknown;
      const fn = fnScript.runInContext(ctx, { timeout: VALIDATOR_TIMEOUT_MS });
      if (typeof fn !== 'function') {
        return 'Validator failed: Validator must evaluate to a function.';
      }
      ctx.__fn = fn;
      ctx.__input = toVmValue(input, vmParse);
      ctx.__answers = toVmValue(answers ?? {}, vmParse);
      const result = vm.runInContext('__fn(__input, __answers)', ctx, { timeout: VALIDATOR_TIMEOUT_MS });
      return typeof result === 'boolean' || typeof result === 'string'
        ? result
        : `Validator failed: Expected boolean or string, got ${typeof result}.`;
    } catch (error) {
      return `Validator failed: ${error instanceof Error ? error.message : String(error)}`;
    }
  };
}

import Handlebars from 'handlebars';

export type Answers = Record<string, unknown>;

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
  if (platform === 'win32') return `"${value.replace(/"/g, '""')}"`;
  return `'${value.replace(/'/g, `'\\''`)}'`;
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
    fn = hbs.compile(template, { noEscape: true });
    compiled.set(template, fn);
  }
  return fn(answers).trim();
}

export type Validator = (input: unknown, answers: Answers) => boolean | string;

/**
 * Turn a validator written in the config file (`"input => input.length > 0"`)
 * into a function. Config files are trusted input, the same as the commands
 * they contain.
 */
export function createValidator(source: string): Validator {
  const fn = new Function('input', 'answers', `"use strict"; return (${source})(input, answers);`) as Validator;
  return (input, answers) => {
    try {
      return fn(input, answers);
    } catch (error) {
      return `Validator failed: ${error instanceof Error ? error.message : String(error)}`;
    }
  };
}

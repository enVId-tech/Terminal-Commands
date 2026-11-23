import inquirer from 'inquirer';
import type { CommandNode, CommandOption } from '../app/types/commands.ts';
import { createValidator, render, type Answers } from './template.ts';
import { runShellCommands, runSource, type RunContext } from './runner.ts';

type Question = Record<string, unknown>;

/** Newer inquirer versions renamed "list" to "select"; configs written by the web editor still say "list". */
const TYPE_ALIASES: Record<string, string> = { list: 'select' };

/** Turn a config option into an inquirer question. */
export function toQuestion(option: CommandOption, known: Answers = {}): Question {
  const { validate, ...rest } = option;
  const question: Question = { ...rest, type: TYPE_ALIASES[option.type] ?? option.type };
  if (typeof validate === 'string') {
    const validator = createValidator(validate);
    question.validate = (input: unknown, answers: Answers) => validator(input, { ...known, ...answers });
  }
  return question;
}

/** Ask a list of questions. Returns the answers keyed by option name. */
export async function ask(options: CommandOption[] = [], known: Answers = {}): Promise<Answers> {
  if (options.length === 0) return {};
  return (await inquirer.prompt(options.map((option) => toQuestion(option, known)) as never)) as Answers;
}

async function choose(message: string, choices: string[]): Promise<string> {
  const { value } = await inquirer.prompt([{ type: 'select', name: 'value', message, choices }] as never) as { value: string };
  return value;
}

async function confirm(message: string, initial: boolean): Promise<boolean> {
  const { value } = await inquirer.prompt([{ type: 'confirm', name: 'value', message, default: initial }] as never) as { value: boolean };
  return value;
}

/** The command templates a node wants to run, in order. */
export function collectCommands(node: CommandNode, answers: Answers): string[] {
  if (node.executeCommands?.length) return node.executeCommands;
  if (typeof node.execute === 'string') return [node.execute];
  if (node.execute && typeof node.execute === 'object') {
    // A map from the first answer's value to the command to run.
    const key = node.options?.[0]?.name ?? Object.keys(answers)[0];
    const chosen = String(answers[key]);
    const command = Object.hasOwn(node.execute, chosen) ? node.execute[chosen] : undefined;
    if (typeof command === 'string' && command) return [command];
    console.error(`No command defined for "${chosen}".`);
  }
  return [];
}

async function execute(node: CommandNode, commands: string[], parallel: boolean, answers: Answers, ctx: RunContext) {
  const rendered = commands.map((command) => render(command, answers)).filter(Boolean);
  if (rendered.length === 0) return;
  if (node.language && node.language !== 'default') {
    for (const source of rendered) await runSource(source, node.language, ctx);
  } else {
    await runShellCommands(rendered, parallel, ctx);
  }
}

/** Run a command or subcommand: prompt, execute, descend into subcommands, then run the post commands. */
export async function executeNode(node: CommandNode, inherited: Answers, ctx: RunContext): Promise<void> {
  const answers: Answers = Object.assign(Object.create(null) as Answers, inherited, await ask(node.options, inherited));

  const commands = collectCommands(node, answers);
  if (commands.length > 0) {
    let parallel = !!node.executeParallel;
    if (node.requireExecutionChoice) parallel = await confirm('Run the commands in parallel?', parallel);
    await execute(node, commands, parallel, answers, ctx);
  }

  if (node.subcommands?.length) {
    const name = await choose(`Select a ${node.name} operation:`, node.subcommands.map((sub) => sub.name));
    const sub = node.subcommands.find((candidate) => candidate.name === name);
    if (sub) await executeNode(sub, answers, ctx);
  }

  const post = [...(node.postExecute ? [node.postExecute] : []), ...(node.postExecuteCommands ?? [])];
  if (post.length > 0) {
    console.log('Running post-execution commands...');
    await execute({ ...node, language: undefined }, post, !!node.postExecuteParallel, answers, ctx);
  }
}

export { choose };

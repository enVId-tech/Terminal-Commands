/**
 * Represents an option for a command.
 */
export interface CommandOption {
  /**
   * The type of the option.
   */
  type: 'input' | 'list' | 'confirm' | 'password' | 'editor' | 'checkbox' | 'number';

  /**
   * The name of the option.
   */
  name: string;

  /**
   * The message to display for the option.
   */
  message: string;

  /**
   * The choices available for the option, if applicable.
   */
  choices?: string[];

  /**
   * The default value for the option.
   */
  default?: string | boolean | number;

  /**
   * The validation rule for the option.
   */
  validate?: string;
}

/**
 * A node in the command tree. Top-level commands and nested subcommands share
 * the same shape, so the CLI can execute them with one code path.
 */
export interface CommandNode {
  /** The name shown in the menu. */
  name: string;

  /** A brief description of the command. */
  description?: string;

  /** Prompts asked before the commands run. Answers are available to templates. */
  options?: CommandOption[];

  /**
   * Legacy single command, or a map from an answer value to the command to run.
   * Prefer `executeCommands`.
   */
  execute?: string | Record<string, string>;

  /** Commands (Handlebars templates) to execute. */
  executeCommands?: string[];

  /** Run `executeCommands` in parallel instead of one after another. */
  executeParallel?: boolean;

  /** Ask the user at runtime whether to run in parallel. */
  requireExecutionChoice?: boolean;

  /** Treat the commands as source code of this language instead of shell. */
  language?: string;

  /** Nested commands the user can pick from. */
  subcommands?: CommandNode[];

  /** Legacy single command that runs after everything else. */
  postExecute?: string;

  /** Commands that run after the main commands and subcommands. */
  postExecuteCommands?: string[];

  /** Run the post commands in parallel. */
  postExecuteParallel?: boolean;
}

export type Command = CommandNode;
export type SubCommand = CommandNode;

/**
 * Represents the configuration for commands.
 */
export interface CommandConfig {
  /**
   * An array of commands in the configuration.
   */
  commands: Command[];
}
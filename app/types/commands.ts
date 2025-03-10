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
 * Represents a command in the command configuration.
 */
export interface Command {
  /**
   * The name of the command.
   */
  name: string;

  /**
   * A brief description of the command.
   */
  description?: string;

  /**
   * The options available for the command.
   */
  options?: CommandOption[];

  /**
   * The command or commands to execute for this command.
   * Can be a single command as a string or a record of commands.
   */
  execute?: string | Record<string, string>;

  /**
   * An array of commands to execute for this command.
   */
  executeCommands?: string[];

  /**
   * Whether to execute the commands in parallel.
   */
  executeParallel?: boolean;

  /**
   * The programming language for the command.
   */
  language?: string;

  /**
   * Whether the execution choice is required.
   */
  requireExecutionChoice?: boolean;

  /**
   * An array of subcommands for this command.
   */
  subcommands?: SubCommand[];
}

/**
 * Represents a subcommand in the command configuration.
 */
export interface SubCommand {
  /**
   * The name of the subcommand.
   */
  name: string;

  /**
   * A brief description of the subcommand.
   */
  description?: string;

  /**
   * The options available for the subcommand.
   */
  options?: CommandOption[];

  /**
   * The command or commands to execute for this subcommand.
   * Can be a single command as a string or a record of commands.
   */
  execute?: string | Record<string, string>;

  /**
   * An array of commands to execute for this subcommand.
   */
  executeCommands?: string[];

  /**
   * Whether to execute the commands in parallel.
   */
  executeParallel?: boolean;

  /**
   * Whether the execution choice is required.
   */
  requireExecutionChoice?: boolean;

  /**
   * The programming language for the subcommand.
   */
  language?: string;

  /**
   * An array of subcommands for this subcommand.
   */
  subcommands?: SubCommand[];

  /**
   * An array of commands to execute after the main commands.
   */
  postExecuteCommands?: string[];

  /**
   * Whether to execute the post commands in parallel.
   */
  postExecuteParallel?: boolean;
}

/**
 * Represents the configuration for commands.
 */
export interface CommandConfig {
  /**
   * An array of commands in the configuration.
   */
  commands: Command[];
}
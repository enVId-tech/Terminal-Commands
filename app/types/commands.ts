// app/types/commands.ts

export interface CommandOption {
  type: 'input' | 'list' | 'confirm' | 'password' | 'editor' | 'checkbox' | 'number';
  name: string;
  message: string;
  choices?: string[];
  default?: string | boolean | number;
  validate?: string;
}

export interface Command {
  name: string;
  description?: string;
  options?: CommandOption[];
  execute?: string | Record<string, string>;
  executeCommands?: string[];
  executeParallel?: boolean;
  language?: string;
  requireExecutionChoice?: boolean;
  subcommands?: SubCommand[];
}

export interface SubCommand {
  name: string;
  description?: string;
  options?: CommandOption[];
  execute?: string | Record<string, string>;
  executeCommands?: string[];
  executeParallel?: boolean;
  requireExecutionChoice?: boolean;
  language?: string;
  subcommands?: SubCommand[];
  postExecuteCommands?: string[];
  postExecuteParallel?: boolean;
}

export interface CommandConfig {
  commands: Command[];
}
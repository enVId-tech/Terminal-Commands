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
  options?: CommandOption[];
  execute?: string | Record<string, string>; // For backward compatibility
  executeCommands?: string[];
  executeParallel?: boolean;
  requireExecutionChoice?: boolean; // Made optional
  subcommands?: SubCommand[];
  description?: string;
}

export interface SubCommand {
  name: string;
  options?: CommandOption[];
  execute?: string | Record<string, string>;
  executeCommands?: string[];
  executeParallel?: boolean;
  requireExecutionChoice?: boolean; // Made optional
  postExecute?: string; // Legacy support
  postExecuteCommands?: string[];
  postExecuteParallel?: boolean;
}

export interface CommandConfig {
  commands: Command[];
}
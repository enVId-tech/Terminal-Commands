// types/commands.ts

export interface CommandOption {
  type: 'input' | 'list' | 'confirm' | 'password' | 'editor' | 'checkbox' | 'number';
  name: string;
  message: string;
  choices?: string[];
  default?: string | boolean | number;
  validate?: string;
}

export interface SubCommand {
  name: string;
  options?: CommandOption[];
  subcommands?: SubCommand[];
  execute?: string | Record<string, string>;
}

export interface Command {
  name: string;
  options?: CommandOption[];
  subcommands?: SubCommand[];
  execute?: string | Record<string, string>;
}

export interface CommandConfig {
  commands: Command[];
}
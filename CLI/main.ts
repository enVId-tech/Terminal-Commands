import inquirer from 'inquirer';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import yaml from 'js-yaml';

// Convert callback-based exec to Promise-based for use with async/await
const execPromise = promisify(exec);

// CHANGE THIS
const dataDirPath: string = '../data'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.on('SIGINT', () => {
  console.log('\n\nProgram terminated with Ctrl+C');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nProgram terminated');
  process.exit(0);
});

// Register custom Handlebars helpers
Handlebars.registerHelper('includes', function(array, value) {
  return Array.isArray(array) && array.includes(value);
});

// Load commands from JSON or YAML file
const loadCommands = (configPath: string): any => {
  try {
    const configData = fs.readFileSync(configPath, 'utf8');

    // Determine file format based on extension
    const extension = path.extname(configPath).toLowerCase();

    if (extension === '.json') {
      return JSON.parse(configData);
    } else if (extension === '.yml' || extension === '.yaml') {
      return yaml.load(configData);
    } else {
      console.error('Unsupported file format. Please use .json, .yml, or .yaml');
      process.exit(1);
    }
  } catch (error) {
    console.error('Failed to load commands configuration:', error);
    process.exit(1);
  }
};

async function runCommand(commandTemplate: string, answers: Record<string, unknown>): Promise<void> {
  if (!commandTemplate?.trim()) return;

  const template = Handlebars.compile(commandTemplate);
  const command = template(answers).trim();
  if (!command) return;

  console.log(`Executing: ${command}`);

  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    const childProcess = spawn(
        isWindows ? 'cmd' : 'sh',
        [isWindows ? '/c' : '-c', command],
        {
          stdio: 'inherit',
          env: {...process.env},
          windowsHide: true
        }
    );

    // Create a unique handler for this specific child process
    const sigintHandler = () => {
      if (!childProcess.killed) {
        childProcess.kill('SIGINT');
        console.log('\nCommand was terminated with Ctrl+C');
      }
    };

    // Use a named handler and add it just for this process execution
    process.prependListener('SIGINT', sigintHandler);

    childProcess.on('error', (err) => {
      console.error(`Command failed: ${err.message}`);
      // Ensure handler is removed
      process.removeListener('SIGINT', sigintHandler);
      resolve();
    });

    childProcess.on('close', (code) => {
      // Always remove the handler when done
      process.removeListener('SIGINT', sigintHandler);

      if (code === 0) {
        console.log('✓ Command completed');
      } else if (code === null || code === 130) {
        console.log('\nCommand was terminated with Ctrl+C');
      } else {
        console.error(`⚠ Command exited with code ${code}`);
      }

      resolve();
    });
  });
}

async function processOptions(options: any[]): Promise<any> {
  if (!options || options.length === 0) return {};

  // Process function strings (like validators) into actual functions
  const processedOptions = options.map(option => {
    const processed = { ...option };
    if (typeof option.validate === 'string') {
      try {
        processed.validate = new Function('input', `return (${option.validate})(input)`);
      } catch (error) {
        delete processed.validate;
      }
    }
    return processed;
  });

  return await safePrompt(processedOptions);
}

async function runCommands(commandTemplates: string[], answers: any, runParallel: boolean = false): Promise<void> {
  if (!commandTemplates || commandTemplates.length === 0) {
    console.log('No commands to execute');
    return;
  }

  try {
    if (runParallel) {
      // Execute commands in parallel
      console.log('Executing commands in parallel:');
      commandTemplates.forEach(cmd => {
        if (cmd && cmd.trim() !== '') console.log(`- ${cmd}`);
      });

      await Promise.all(
          commandTemplates
              .filter(cmd => cmd && cmd.trim() !== '')
              .map(commandTemplate => runCommand(commandTemplate, answers))
      );

      console.log('All parallel commands completed');
    } else {
      // Execute commands sequentially
      console.log('Executing commands sequentially:');
      commandTemplates.forEach(cmd => {
        if (cmd && cmd.trim() !== '') console.log(`- ${cmd}`);
      });

      for (const commandTemplate of commandTemplates) {
        if (commandTemplate && commandTemplate.trim() !== '') {
          await runCommand(commandTemplate, answers);
        }
      }

      console.log('All sequential commands completed');
    }
  } catch (error) {
    console.error('Error executing commands:', error);
  }
}

async function handleSubcommand(subcommand: any, parentAnswers: Record<string, unknown> = {}): Promise<void> {
  console.log(`Processing subcommand: ${subcommand.name}`);

  // Get user inputs for the subcommand's options
  const subcommandAnswers = subcommand.options ? await processOptions(subcommand.options) : {};

  // Combine with parent answers (for variable access across levels)
  const answers = { ...parentAnswers, ...subcommandAnswers };

  // First, execute this subcommand's commands (if any)
  if (Array.isArray(subcommand.executeCommands) && subcommand.executeCommands.length > 0) {
    let shouldRunParallel = !!subcommand.executeParallel;

    // If requireExecutionChoice is true, ask the user for execution preference
    if (subcommand.requireExecutionChoice) {
      const { runInParallel } = await inquirer.prompt([{
        type: 'confirm',
        name: 'runInParallel',
        message: 'Run commands in parallel?',
        default: shouldRunParallel
      }]);
      shouldRunParallel = runInParallel;
    }

    await runCommands(subcommand.executeCommands, answers, shouldRunParallel);
  } else if (typeof subcommand.execute === 'object') {
    // Dynamic command based on answer - for backward compatibility
    const commandKey = answers[Object.keys(answers)[0]];
    if (subcommand.execute[commandKey]) {
      await runCommand(subcommand.execute[commandKey], answers);
    } else {
      console.error(`No command defined for ${commandKey}`);
    }
  } else if (typeof subcommand.execute === 'string' && subcommand.execute) {
    // Legacy single command
    await runCommand(subcommand.execute, answers);
  }

  // Then, check if this subcommand has nested subcommands
  if (subcommand.subcommands && subcommand.subcommands.length > 0) {
    // Handle nested subcommands
    const { nestedSubcommandType } = await inquirer.prompt([{
      type: 'list',
      name: 'nestedSubcommandType',
      message: `Select ${subcommand.name} operation:`,
      choices: subcommand.subcommands.map((sub: any) => sub.name)
    }]);

    const selectedNestedSubcommand = subcommand.subcommands.find(
        (sub: any) => sub.name === nestedSubcommandType
    );

    if (selectedNestedSubcommand) {
      // Recursively handle the selected nested subcommand with the current answers passed down
      await handleSubcommand(selectedNestedSubcommand, answers);
    }
  }

  // Handle post execution if needed
  if (subcommand.postExecute || subcommand.postExecuteCommands) {
    console.log('Running post-execution tasks...');
    if (typeof subcommand.postExecute === 'string') {
      await runCommand(subcommand.postExecute, answers);
    } else if (Array.isArray(subcommand.postExecuteCommands)) {
      await runCommands(
          subcommand.postExecuteCommands,
          answers,
          subcommand.postExecuteParallel || false
      );
    }
  }
}

async function handleCommand(command: any): Promise<void> {
  // Get user inputs for the command's options
  const answers = command.options ? await processOptions(command.options) : {};

  // First, execute this command's commands if defined
  if (Array.isArray(command.executeCommands) && command.executeCommands.length > 0) {
    let shouldRunParallel = !!command.executeParallel;

    if (command.requireExecutionChoice) {
        // If requireExecutionChoice is true, ask the user for execution preference
      const { runInParallel } = await safePrompt([
        {
          type: 'confirm',
          name: 'runInParallel',
          message: 'Run commands in parallel?',
          default: shouldRunParallel
        }
      ]);

      shouldRunParallel = runInParallel;
    }

    await runCommands(command.executeCommands, answers, shouldRunParallel);
  } else if (command.execute) {
    // Legacy single command format
    await runCommand(command.execute, answers);
  }

  // Then, check if this command has subcommands
  if (command.subcommands && command.subcommands.length > 0) {
    // Handle commands with subcommands
    const { subcommandType } = await inquirer.prompt([{
      type: 'list',
      name: 'subcommandType',
      message: `Select ${command.name} operation:`,
      choices: command.subcommands.map((sub: any) => sub.name)
    }]);

    const selectedSubcommand = command.subcommands.find(
        (sub: any) => sub.name === subcommandType
    );

    if (selectedSubcommand) {
      // Handle the subcommand with the command-level answers passed down
      await handleSubcommand(selectedSubcommand, answers);
    }
  }
}

async function selectConfigFile(): Promise<string> {
  try {
    // Find all JSON and YAML files in the data directory
    const dataDir = path.join(__dirname, dataDirPath);
    const files = fs.readdirSync(dataDir).filter(file =>
        ['.json', '.yml', '.yaml'].includes(path.extname(file).toLowerCase())
    );

    if (files.length === 0) {
      console.error('No config files found in the data directory.');
      process.exit(1);
    }

    let configPath;

    if (files.length === 1) {
      configPath = path.join(dataDir, files[0]);
    } else {
      const { selectedFile } = await inquirer.prompt([{
        type: 'list',
        name: 'selectedFile',
        message: 'Select a configuration file:',
        choices: files
      }]);
      configPath = path.join(dataDir, selectedFile);
    }

    return configPath;
  } catch (error) {
    if (error.name === 'ExitPromptError') {
      console.log('\nConfig selection terminated with Ctrl+C');
      process.exit(0);
    }
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    // Allow user to select which config file to use
    const configPath = await selectConfigFile();
    const config = loadCommands(configPath);
    const commands = config.commands;

    if (!commands || commands.length === 0) {
      console.log('No commands defined in the configuration file.');
      return;
    }

    // Build the main menu from the command configuration
    const { commandType } = await safePrompt([
      {
        type: 'list',
        name: 'commandType',
        message: 'Select the type of command you want to execute:',
        choices: commands.map((cmd: any) => cmd.name)
      }
    ]);

    // Find the selected command
    const selectedCommand = commands.find((cmd: any) => cmd.name === commandType);

    if (selectedCommand) {
      await handleCommand(selectedCommand);
    } else {
      console.error(`Command ${commandType} not found in configuration`);
    }
  } catch (error) {
    if (error.name === 'ExitPromptError') {
      console.log('\nProgram terminated with Ctrl+C');
      process.exit(0);
    } else {
      console.error('An error occurred:', error);
    }
  }
}

async function safePrompt(questions: any[]): Promise<any> {
  try {
    return await inquirer.prompt(questions);
  } catch (error) {
    if (error.name === 'ExitPromptError') {
      console.log('\nPrompt terminated with Ctrl+C');
      process.exit(0); // Clean exit without error message
    }
    throw error; // Re-throw other errors
  }
}

// Use function call to start the program
main().catch(error => {
  if (error.name === 'ExitPromptError') {
    console.log('\nProgram terminated with Ctrl+C');
    process.exit(0); // Clean exit
  } else {
    console.error('An error occurred:', error);
  }
});
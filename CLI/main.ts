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
const dataDirPath: string = '../data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');

    // Handle npx/npm commands on Windows
    const isWindows = process.platform === 'win32';
    const executable = isWindows && (cmd === 'npx' || cmd === 'npm') ? `${cmd}.cmd` : cmd;

    const childProcess = spawn(executable, args, {
      stdio: 'inherit',
      shell: isWindows, // Use shell on Windows
      env: process.env
    });

    childProcess.on('error', (err) => {
      reject(new Error(`Failed to start command: ${err.message}`));
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Command completed successfully!');
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function processOptions(options: any[]): Promise<any> {
  if (!options || options.length === 0) return {};

  // Process function strings (like validators) into actual functions
  const processedOptions = options.map(option => {
    const processed = { ...option };
    if (typeof option.validate === 'string') {
      // Convert string validators to functions
      try {
        processed.validate = new Function('input', `return (${option.validate})(input)`);
      } catch (error) {
        console.error(`Failed to parse validator: ${option.validate}`);
        delete processed.validate;
      }
    }
    return processed;
  });

  return inquirer.prompt(processedOptions);
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

async function handleSubcommand(subcommand: any): Promise<void> {
  // Get user inputs for the subcommand's options
  const answers = subcommand.options ? await processOptions(subcommand.options) : {};

  // Determine how to run the commands
  if (Array.isArray(subcommand.executeCommands)) {
    // If executeParallel is true, run in parallel, otherwise sequential
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
  } else if (typeof subcommand.execute === 'string') {
    // Legacy single command
    await runCommand(subcommand.execute, answers);
  }

  // Handle post execution if needed
  if (subcommand.postExecute) {
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
  if (command.subcommands && command.subcommands.length > 0) {
    // Handle commands with subcommands
    const { subcommandType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'subcommandType',
        message: `Select ${command.name} operation:`,
        choices: command.subcommands.map((sub: any) => sub.name)
      }
    ]);

    const selectedSubcommand = command.subcommands.find(
      (sub: any) => sub.name === subcommandType
    );

    if (selectedSubcommand) {
      await handleSubcommand(selectedSubcommand);
    }
  } else {
    // Get user inputs for the command's options
    const answers = command.options ? await processOptions(command.options) : {};

    // Determine execution method
    if (Array.isArray(command.executeCommands)) {
      let shouldRunParallel = !!command.executeParallel;

      if (command.requireExecutionChoice) {
        const { runInParallel } = await inquirer.prompt([{
          type: 'confirm',
          name: 'runInParallel',
          message: 'Run commands in parallel?',
          default: shouldRunParallel
        }]);
        shouldRunParallel = runInParallel;
      }

      await runCommands(command.executeCommands, answers, shouldRunParallel);
    } else if (command.execute) {
      // Legacy single command format
      await runCommand(command.execute, answers);
    }
  }
}

async function selectConfigFile(): Promise<string> {
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
}

async function main(): Promise<void> {
  // Allow user to select which config file to use
  const configPath = await selectConfigFile();
  const config = loadCommands(configPath);
  const commands = config.commands;

  if (!commands || commands.length === 0) {
    console.log('No commands defined in the configuration file.');
    return;
  }

  // Build the main menu from the command configuration
  const { commandType } = await inquirer.prompt([
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
}

// Use function call to start the program
main().catch(error => {
  console.error('An error occurred:', error);
});
import inquirer from 'inquirer';
import { exec } from 'child_process';
import { promisify } from 'util';
import  * as fs from 'fs';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';

// Convert callback-based exec to Promise-based for use with async/await
const execPromise = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load commands from JSON file
const loadCommands = (): any => {
  try {
    const configPath = path.join(__dirname, 'commands.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Failed to load commands configuration:', error);
    process.exit(1);
  }
};

async function runCommand(commandTemplate: string, answers: any): Promise<void> {
  try {
    // Compile the command template with Handlebars
    const template = Handlebars.compile(commandTemplate);
    const command = template(answers);

    console.log(`Executing: ${command}`);
    const { stdout, stderr } = await execPromise(command);

    if (stdout) console.log(`Command output: ${stdout}`);
    if (stderr) console.error(`Command errors: ${stderr}`);

    console.log('Command completed successfully!');
  } catch (error) {
    console.error('Command failed:', error);
  }
}

async function processOptions(options: any[]): Promise<any> {
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

async function handleSubcommand(subcommand: any): Promise<void> {
  if (subcommand.options) {
    const answers = await processOptions(subcommand.options);

    // Handle dynamic command based on answers
    if (typeof subcommand.execute === 'object') {
      const commandKey = answers[Object.keys(answers)[0]];
      if (subcommand.execute[commandKey]) {
        await runCommand(subcommand.execute[commandKey], answers);
      } else {
        console.error(`No command defined for ${commandKey}`);
      }
    } else if (typeof subcommand.execute === 'string') {
      await runCommand(subcommand.execute, answers);
    }
  } else if (subcommand.execute) {
    await runCommand(subcommand.execute, {});
  }
}

async function main(): Promise<void> {
  const config = loadCommands();
  const commands = config.commands;

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
    if (selectedCommand.subcommands) {
      // Handle commands with subcommands
      const { subcommandType } = await inquirer.prompt([
        {
          type: 'list',
          name: 'subcommandType',
          message: `Select ${selectedCommand.name} operation:`,
          choices: selectedCommand.subcommands.map((sub: any) => sub.name)
        }
      ]);

      const selectedSubcommand = selectedCommand.subcommands.find(
        (sub: any) => sub.name === subcommandType
      );

      if (selectedSubcommand) {
        await handleSubcommand(selectedSubcommand);
      }
    } else if (selectedCommand.options) {
      // Handle commands with direct options
      const answers = await processOptions(selectedCommand.options);
      await runCommand(selectedCommand.execute, answers);
    } else if (selectedCommand.execute) {
      // Handle commands with no options
      await runCommand(selectedCommand.execute, {});
    }
  } else {
    console.error(`Command ${commandType} not found in configuration`);
  }
}

main().catch(error => {
  console.error('An error occurred:', error);
});
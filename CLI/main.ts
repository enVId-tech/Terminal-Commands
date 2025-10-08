import inquirer from 'inquirer';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import os from 'os';
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

function executeCommand(command: string): void {
  // Use detached mode for background processes
  const child = spawn(command, [], {
    shell: true,
    stdio: 'inherit',
    detached: false // Keep this false for normal commands, but can be true for background tasks
  });

  child.on('error', (error) => {
    console.error(`Error executing command: ${error.message}`);
  });
}

async function executeCommandSync(command: string): Promise<void> {
  try {
    console.log(`Executing: ${command}`);

    // Use maxBuffer option to prevent buffer overflow errors for large outputs
    const { stdout, stderr } = await execPromise(command, { maxBuffer: 10 * 1024 * 1024 }); // 10MB buffer

    // Avoid unnecessary console output for large responses
    if (stdout && stdout.length < 5000) console.log(stdout);
    else if (stdout) console.log(`Command produced ${stdout.length} bytes of output`);

    if (stderr) console.error(stderr);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Command failed: ${error.message as string}`);
    }
    throw error;
  }
}

// Register custom Handlebars helpers
Handlebars.registerHelper('includes', function (array, value) {
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
    
    // Parse command to avoid extra shell layers for npm commands
    const parts = command.split(/\s+/);
    const isDirectExecutable = ['npm', 'npx', 'yarn', 'pnpm', 'git'].includes(parts[0]);
    
    let childProcess;
    
    if (isDirectExecutable && !command.includes('&&') && !command.includes('||') && !command.includes('|')) {
      // Execute directly without shell for better performance
      childProcess = spawn(parts[0], parts.slice(1), {
        stdio: 'inherit',
        env: {...process.env},
        windowsHide: false
      });
    } else {
      // Use shell for complex commands
      childProcess = spawn(
          isWindows ? 'cmd' : 'sh',
          [isWindows ? '/c' : '-c', command],
          {
            stdio: 'inherit',
            env: {...process.env},
            windowsHide: false
          }
      );
    }

    const sigintHandler = () => {
      if (!childProcess.killed) {
        childProcess.kill('SIGINT');
        console.log('\nCommand was terminated with Ctrl+C');
      }
    };

    process.prependListener('SIGINT', sigintHandler);

    childProcess.on('error', (err) => {
      console.error(`Command failed: ${err.message}`);
      process.removeListener('SIGINT', sigintHandler);
      resolve();
    });

    childProcess.on('close', (code) => {
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
        return error;
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

async function handleCommand(selectedCommand: any): Promise<void> {
  // First check if it has subcommands
  if (selectedCommand.subcommands && selectedCommand.subcommands.length > 0) {
    const { subcommandName } = await safePrompt([
      {
        type: 'list',
        name: 'subcommandName',
        message: 'Select a subcommand:',
        choices: selectedCommand.subcommands.map((sub: any) => sub.name)
      }
    ]);

    const selectedSubcommand = selectedCommand.subcommands.find(
      (sub: any) => sub.name === subcommandName
    );

    if (selectedSubcommand) {
      await handleCommand(selectedSubcommand);
    }
    return;
  }

  // Process options if present
  let optionsData = {};
  if (selectedCommand.options && selectedCommand.options.length > 0) {
    optionsData = await safePrompt(selectedCommand.options);
  }

  // Handle command execution
  if (selectedCommand.executeCommands && selectedCommand.executeCommands.length > 0) {
    // Add confirmation if required
    if (selectedCommand.requireExecutionChoice) {
      const { confirmExecution } = await safePrompt([
        {
          type: 'confirm',
          name: 'confirmExecution',
          message: 'Execute the commands now?',
          default: true
        }
      ]);

      if (!confirmExecution) {
        console.log('Command execution cancelled.');
        return;
      }
    }

    // Process commands based on language and execute them
    for (const cmd of selectedCommand.executeCommands) {
      const language = selectedCommand.language || 'default';
      const processedCmd = processTemplate(cmd, optionsData);

      if (selectedCommand.executeParallel) {
        executeCommandByLanguage(processedCmd, language, true);
      } else {
        await executeCommandByLanguage(processedCmd, language, false);
      }
    }
  }
}

// Function to execute commands based on language
// ...existing code...
// Function to execute commands based on language
async function executeCommandByLanguage(command: string, language = 'default', inParallel = false): Promise<void> {
  // For default shell commands, skip temp file creation entirely
  if (language === 'default') {
    if (inParallel) {
      executeCommand(command);
    } else {
      await runCommand(command, {}); // Use runCommand instead of executeCommandSync
    }
    return;
  }

  // Only create temp files for actual code languages
  const tmpFileName: string = getTempFilename(language);
  const tmpPath = path.join(os.tmpdir(), tmpFileName);
  await fs.promises.writeFile(tmpPath, command);

  // For some languages we may create additional files we want to clean up
  let extraFilesToClean: string[] = [];

  try {
    let execCmd;
    switch (language) {
      case 'javascript':
        execCmd = `node "${tmpPath}"`;
        break;
      case 'typescript':
        execCmd = `node "${tmpPath}"`;
        break;
      case 'cpp':
        const cppOutFile = tmpPath.replace(/\.[^/.]+$/, '');
        execCmd = `g++ "${tmpPath}" -o "${cppOutFile}" && "${cppOutFile}"`;
        break;
      case 'csharp':
        execCmd = `dotnet script "${tmpPath}"`;
        break;
      case 'java': {
        // Write the Java file into the temp dir and run from that dir/classpath
        const className: string = extractClassName(command) || 'Main';
        const javaPath = path.join(os.tmpdir(), `${className}.java`);
        await fs.promises.writeFile(javaPath, command);
        extraFilesToClean.push(javaPath, path.join(os.tmpdir(), `${className}.class`));
        // compile to temp dir and execute with classpath
        execCmd = `javac "${javaPath}" -d "${os.tmpdir()}" && java -cp "${os.tmpdir()}" ${className}`;
        break;
      }
      case 'kotlin':
        execCmd = `kotlinc "${tmpPath}" -include-runtime -d "${tmpPath}.jar" && java -jar "${tmpPath}.jar"`;
        extraFilesToClean.push(`${tmpPath}.jar`);
        break;
      default:
        execCmd = command;
    }

    await runCommand(execCmd, {});
  } catch (error: unknown) {
    // Preserve message for debugging
    const msg = error instanceof Error ? `${error.message}` : String(error);
    throw new Error(`Error at executeCommandByLanguage in main.ts: ${msg}`);
  } finally {
    // Best-effort cleanup; ignore ENOENT
    try {
      await fs.promises.unlink(tmpPath);
    } catch (e: any) {
      if (e && e.code !== 'ENOENT') console.warn('Failed to remove temp file:', e);
    }
    for (const f of extraFilesToClean) {
      try {
        await fs.promises.unlink(f);
      } catch (e: any) {
        if (e && e.code !== 'ENOENT') console.warn('Failed to remove temp file:', e);
      }
    }
  }
}

// Helper functions
function getTempFilename(language: string): string {
  const timestamp = new Date().getTime();
  switch (language) {
    case 'javascript': return `temp_${timestamp}.js`;
    case 'typescript': return `temp_${timestamp}.ts`;
    case 'cpp': return `temp_${timestamp}.cpp`;
    case 'csharp': return `temp_${timestamp}.csx`;
    case 'java': return `temp_${timestamp}.java`;
    case 'kotlin': return `temp_${timestamp}.kt`;
    default: return `temp_${timestamp}.txt`;
  }
}

function extractClassName(javaCode: string): string | null {
  const classMatch = javaCode.match(/public\s+class\s+(\w+)/);
  return classMatch ? classMatch[1] : null;
}

function processTemplate(template: string, data: any): string {
  // Process Handlebars template with data
  const compiledTemplate = Handlebars.compile(template);
  return compiledTemplate(data);
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
    if (error instanceof Error && error.name === 'ExitPromptError') {
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
    if (error instanceof Error && error.name === 'ExitPromptError') {
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
    if (error instanceof Error && error.name === 'ExitPromptError') {
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
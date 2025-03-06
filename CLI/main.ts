import inquirer from 'inquirer';
import { exec, spawn, execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import yaml from 'js-yaml';
import { Worker } from 'worker_threads';

// Convert callback-based exec to Promise-based for use with async/await
const execPromise = promisify(exec);

// Command result cache for repeated commands
const commandResultCache = new Map<string, boolean>();

// CHANGE THIS
const dataDirPath: string = '../data'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Register custom Handlebars helpers
Handlebars.registerHelper('includes', function(array, value) {
  return Array.isArray(array) && array.includes(value);
});

Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
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

async function runCommandWithCaching(commandTemplate: string, answers: Record<string, unknown>): Promise<void> {
  if (!commandTemplate?.trim()) return;

  const template = Handlebars.compile(commandTemplate);
  const command = template(answers).trim();
  if (!command) return;

  // Create a cache key that includes the command and relevant answers
  const cacheKey = `${command}-${JSON.stringify(answers)}`;

  // Check if we've run this exact command before in this session
  if (commandResultCache.has(cacheKey)) {
    console.log(`Using cached result for: ${command}`);
    return Promise.resolve();
  }

  console.log(`Executing: ${command}`);

  return new Promise((resolve) => {
    // Parse the command and arguments
    const [cmd, ...args] = command.split(' ');
    const isWindows = process.platform === 'win32';

    // Optimize spawn configuration
    const childProcess = spawn(
      isWindows && (cmd === 'npx' || cmd === 'npm') ? `${cmd}.cmd` : cmd,
      args,
      {
        stdio: 'inherit',
        shell: true,
        env: {...process.env},
        windowsHide: true, // Prevent command windows from appearing on Windows
        windowsVerbatimArguments: isWindows // Better handling of Windows arguments
      }
    );

    childProcess.on('error', (err) => {
      console.error(`Command failed to start: ${err.message}`);
      if (err.message.includes('PRN')) {
        console.error('This may be a Windows device access issue. Try running as administrator.');
      }
      resolve(); // Continue with other commands even if this one fails
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✓ Command completed successfully!');
        commandResultCache.set(cacheKey, true);
      } else {
        console.error(`⚠ Command exited with code ${code}`);
      }
      resolve();
    });
  });
}

async function runCommandsWithWorkers(commandTemplates: string[], answers: any): Promise<void> {
  return new Promise((resolve) => {
    const workers = commandTemplates
      .filter(cmd => cmd && cmd.trim() !== '')
      .map(cmd => {
        return new Promise<void>((workerResolve) => {
          const worker = new Worker(
            `
            const { parentPort } = require('worker_threads');
            const { spawn } = require('child_process');
            const Handlebars = require('handlebars');

            parentPort.once('message', ({ command, answers }) => {
              const template = Handlebars.compile(command);
              const cmdStr = template(answers).trim();
              const [cmd, ...args] = cmdStr.split(' ');
              
              const isWindows = process.platform === 'win32';
              const executable = isWindows && (cmd === 'npx' || cmd === 'npm') ? \`\${cmd}.cmd\` : cmd;

              console.log(\`Worker executing: \${cmdStr}\`);
              const childProcess = spawn(executable, args, {
                stdio: 'inherit',
                shell: true,
                env: process.env,
                windowsHide: true,
                windowsVerbatimArguments: isWindows
              });

              childProcess.on('close', (code) => {
                parentPort.postMessage({ 
                  success: code === 0, 
                  command: cmdStr, 
                  code 
                });
              });
            });
            `,
            { eval: true }
          );

          worker.postMessage({ command: cmd, answers });
          worker.on('message', (result) => {
            if (result.success) {
              console.log(`✓ Worker completed: ${result.command}`);
            } else {
              console.error(`⚠ Worker command exited with code ${result.code}: ${result.command}`);
            }
            worker.terminate();
            workerResolve();
          });
        });
      });

    Promise.all(workers).then(() => {
      console.log('All parallel workers completed');
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

async function runCommandsSequentially(commandTemplates: string[], answers: any): Promise<void> {
  if (!commandTemplates || commandTemplates.length === 0) return;

  console.log('Running sequential commands with optimized execution...');

  // Filter and compile the commands first
  const compiledCommands = commandTemplates
      .filter(cmd => cmd && cmd.trim() !== '')
      .map(cmd => {
        const template = Handlebars.compile(cmd);
        const command = template(answers).trim();
        return command ? command : null;
      })
      .filter(Boolean) as string[];

  if (compiledCommands.length === 0) return;

  // Categorize commands for specialized handling
  const npmCommands = compiledCommands.filter(cmd => cmd.startsWith('npm ') || cmd.startsWith('npx '));
  const gitCommands = compiledCommands.filter(cmd => cmd.startsWith('git '));
  const otherCommands = compiledCommands.filter(cmd =>
      !cmd.startsWith('npm ') && !cmd.startsWith('npx ') && !cmd.startsWith('git '));

  // Process commands by type for optimal execution
  if (npmCommands.length > 0) {
    await optimizeNpmCommands(npmCommands);
  }

  if (gitCommands.length > 0) {
    await optimizeGitCommands(gitCommands);
  }

  // Process remaining commands individually
  for (const command of otherCommands) {
    await executeCommandDirectly(command);
  }
}

async function executeCommandDirectly(command: string): Promise<void> {
  if (!command || commandResultCache.has(command)) {
    return;
  }

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

    childProcess.on('error', (err) => {
      console.error(`Command failed: ${err.message}`);
      resolve();
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✓ Command completed');
        commandResultCache.set(command, true);
      } else {
        console.error(`⚠ Command exited with code ${code}`);
      }
      resolve();
    });
  });
}

async function optimizeNpmCommands(commands: string[]): Promise<void> {
  // Group by project directory when possible
  const byDirectory = new Map<string, string[]>();

  for (const cmd of commands) {
    // Extract project path if it exists (for --prefix)
    const prefixMatch = cmd.match(/--prefix\s+([^\s]+)/);
    const directory = prefixMatch ? prefixMatch[1] : 'default';

    if (!byDirectory.has(directory)) {
      byDirectory.set(directory, []);
    }
    byDirectory.get(directory)?.push(cmd);
  }

  // Process each directory's commands
  for (const [dir, cmds] of byDirectory.entries()) {
    if (cmds.length === 1 || dir === 'default') {
      // Run individual commands
      for (const cmd of cmds) {
        await runCommandWithMinimalOverhead(cmd);
      }
    } else {
      // Combine multiple npm commands for the same directory
      // e.g., npm install pkg1 && npm install pkg2 => npm install pkg1 pkg2
      const installCmds = cmds.filter(c => c.includes('install') || c.includes('i '));
      if (installCmds.length > 1) {
        const packages = installCmds
          .map(c => c.split('install ')[1] || c.split('i ')[1])
          .filter(Boolean);

        if (packages.length) {
          const combinedCmd = `npm install ${packages.join(' ')} --prefix ${dir}`;
          await runCommandWithMinimalOverhead(combinedCmd);
        }
      }

      // Run other commands individually
      for (const cmd of cmds.filter(c => !c.includes('install') && !c.includes('i '))) {
        await runCommandWithMinimalOverhead(cmd);
      }
    }
  }
}

async function optimizeGitCommands(commands: string[]): Promise<void> {
  // Look for common patterns in git command sequences
  const hasAdd = commands.some(cmd => cmd.includes('git add'));
  const hasCommit = commands.some(cmd => cmd.includes('git commit') || cmd.includes('cz'));
  const hasPush = commands.some(cmd => cmd.includes('git push'));

  // Specific optimization for the common add-commit-push pattern
  if (hasAdd && hasCommit && hasPush) {
    // Execute git add first
    const addCommand = commands.find(cmd => cmd.includes('git add'));
    if (addCommand) await runCommandWithMinimalOverhead(addCommand);

    // Execute commit (either git commit or cz)
    const commitCommand = commands.find(cmd => cmd.includes('git commit') || cmd.includes('cz'));
    if (commitCommand) await runCommandWithMinimalOverhead(commitCommand);

    // Execute push last
    const pushCommand = commands.find(cmd => cmd.includes('git push'));
    if (pushCommand) await runCommandWithMinimalOverhead(pushCommand);

    // Execute any remaining git commands
    const remainingCommands = commands.filter(cmd =>
        !cmd.includes('git add') &&
        !cmd.includes('git commit') &&
        !cmd.includes('cz') &&
        !cmd.includes('git push')
    );

    for (const cmd of remainingCommands) {
      await runCommandWithMinimalOverhead(cmd);
    }
  }
  // For small sets of git commands, batch them
  else if (commands.length > 1 && commands.length <= 4) {
    const batchedGitCommand = commands.join(' && ');
    await runCommandWithMinimalOverhead(batchedGitCommand);
  }
  // Otherwise execute individually
  else {
    for (const cmd of commands) {
      await runCommandWithMinimalOverhead(cmd);
    }
  }
}

async function runCommandWithMinimalOverhead(command: string): Promise<void> {
  const cacheKey = command;

  if (commandResultCache.has(cacheKey)) {
    console.log(`Using cached result for: ${command}`);
    return Promise.resolve();
  }

  console.log(`Executing: ${command}`);

  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    const hasShellSpecialChars = /[|&><^]/.test(command);

    // For complex commands or commands with shell operators, use shell mode
    if (hasShellSpecialChars) {
      const childProcess = spawn(
          isWindows ? 'cmd' : 'sh',
          [isWindows ? '/c' : '-c', command],
          {
            stdio: 'inherit',
            env: {...process.env},
            windowsHide: true
          }
      );

      childProcess.on('error', (err) => {
        console.error(`Command failed to start: ${err.message}`);
        resolve();
      });

      childProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✓ Command completed');
          commandResultCache.set(cacheKey, true);
        } else {
          console.error(`⚠ Command exited with code ${code}`);
        }
        resolve();
      });
    } else {
      // For simple commands, parse the command and use execFile
      const parts = command.split(' ').filter(part => part.trim() !== '');
      const cmd = parts[0];
      const args = parts.slice(1);

      // Handle npm and npx on Windows
      const executable = isWindows && (cmd === 'npx' || cmd === 'npm') ?
          `${cmd}.cmd` : cmd;

      execFile(
          executable,
          args,
          {
            env: {...process.env},
            maxBuffer: 10 * 1024 * 1024, // Increase buffer for large outputs
            shell: isWindows // Use shell on Windows for better path handling
          },
          (error, stdout, stderr) => {
            if (stdout) console.log(stdout);
            if (stderr) console.error(stderr);

            if (error) {
              console.error(`Command failed: ${error.message}`);
              resolve();
            } else {
              console.log('✓ Command completed');
              commandResultCache.set(cacheKey, true);
              resolve();
            }
          }
      );
    }
  });
}

async function runCommands(commandTemplates: string[], answers: any, runParallel: boolean = false): Promise<void> {
  if (!commandTemplates || commandTemplates.length === 0) {
    console.log('No commands to execute');
    return;
  }

  try {
    if (runParallel) {
      // Optimize for different parallel execution strategies
      const smallCommands = commandTemplates.every(cmd => cmd.length < 100);
      const manyCommands = commandTemplates.length > 5;

      // Use batching for many small commands
      if (manyCommands && smallCommands) {
        console.log('Executing batch of commands in parallel');

        const batchedCommand = commandTemplates
          .filter(cmd => cmd && cmd.trim() !== '')
          .map(cmd => {
            const template = Handlebars.compile(cmd);
            return template(answers).trim();
          })
          .join(process.platform === 'win32' ? ' & ' : ' ; ');

        if (batchedCommand) {
          await runCommandWithCaching(batchedCommand, answers);
        }
      }
      // Use worker threads for CPU-intensive operations or fewer larger commands
      else if (commandTemplates.length >= 2 && commandTemplates.length <= 10) {
        console.log('Using worker threads for parallel execution');
        await runCommandsWithWorkers(commandTemplates, answers);
      }
      // Use Promise.all for other cases
      else {
        console.log('Executing commands in parallel with Promise.all:');
        commandTemplates.forEach(cmd => {
          if (cmd && cmd.trim() !== '') console.log(`- ${cmd}`);
        });

        await Promise.all(
          commandTemplates
            .filter(cmd => cmd && cmd.trim() !== '')
            .map(commandTemplate => runCommandWithCaching(commandTemplate, answers))
        );
      }

      console.log('All parallel commands completed');
    } else {
      // Execute commands sequentially with optimized execution
      console.log('Executing commands sequentially:');
      // commandTemplates.forEach(cmd => {
      //   if (cmd && cmd.trim() !== '') console.log(`- ${cmd}`);
      // });
      //
      // for (const commandTemplate of commandTemplates) {
      //   if (commandTemplate && commandTemplate.trim() !== '') {
      //     await runCommandWithCaching(commandTemplate, answers);
      //   }
      // }

      await runCommandsSequentially(commandTemplates, answers);

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

  // Add current branch information for git operations if needed
  if (subcommand.name.includes('git') || (answers.commitMsg && String(answers.commitMsg).includes('{{currentBranch}}'))) {
    try {
      const { stdout } = await execPromise('git branch --show-current');
      answers.currentBranch = stdout.trim();
    } catch (err) {
      console.log('Not in a git repository or git not installed');
      answers.currentBranch = 'unknown';
    }
  }

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
      await runCommandWithCaching(subcommand.execute[commandKey], answers);
    } else {
      console.error(`No command defined for ${commandKey}`);
    }
  } else if (typeof subcommand.execute === 'string' && subcommand.execute) {
    // Legacy single command
    await runCommandWithCaching(subcommand.execute, answers);
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
      await runCommandWithCaching(subcommand.postExecute, answers);
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
    await runCommandWithCaching(command.execute, answers);
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
  try {
    console.log('CLI Command Builder');

    // Select config file
    const configPath = await selectConfigFile();
    console.log(`Using config: ${configPath}`);

    // Load commands from the selected config file
    const commandsConfig = loadCommands(configPath);

    if (!commandsConfig.commands || !Array.isArray(commandsConfig.commands)) {
      console.error('Invalid commands configuration. "commands" array is missing or invalid.');
      process.exit(1);
    }

    // Get user to select a top-level command
    const { commandType } = await inquirer.prompt([{
      type: 'list',
      name: 'commandType',
      message: 'Select command type:',
      choices: commandsConfig.commands.map((cmd: any) => cmd.name)
    }]);

    const selectedCommand = commandsConfig.commands.find(
        (cmd: any) => cmd.name === commandType
    );

    if (!selectedCommand) {
      console.error('Selected command not found in configuration');
      process.exit(1);
    }

    // Handle the selected command
    await handleCommand(selectedCommand);

    console.log('Command execution completed successfully');
  } catch (error) {
    console.error('Error in CLI execution:', error);
    if (error instanceof Error) {
      console.error(`Error details: ${error.message}`);
      if (error.stack) console.error(`Stack trace: ${error.stack}`);
    }
    process.exit(1);
  }
}

// Run the CLI
main();
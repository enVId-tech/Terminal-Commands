'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CommandConfig } from '../types/commands';
import styles from '@/styles/simulator.module.scss';

export default function Simulator() {
  const [config, setConfig] = useState<CommandConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commandLine, setCommandLine] = useState('');
  const [output, setOutput] = useState<Array<{text: string; type: 'normal' | 'command' | 'error' | 'success'}>>([
    { text: 'CLI Simulator started. Type help to see available commands.', type: 'normal' }
  ]);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showCommandTree, setShowCommandTree] = useState(false);
  const router = useRouter();
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadCommands = async () => {
      try {
        const response = await fetch('/api/commands');
        if (!response.ok) throw new Error('Failed to load commands');

        const data = await response.json();
        setConfig(data);
        appendOutput(`Loaded ${data.commands.length} commands`, 'success');
      } catch (error) {
        console.error('Error loading commands:', error);
        appendOutput('Error: Failed to load commands', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadCommands();
  }, []);

  useEffect(() => {
    // Scroll to bottom when output changes
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    // Focus input on load
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const appendOutput = (text: string, type: 'normal' | 'command' | 'error' | 'success' = 'normal') => {
    setOutput(prev => [...prev, { text, type }]);
  };

  const handleCommand = (command: string) => {
    if (!command.trim()) return;

    // Add to history
    setInputHistory(prev => [command, ...prev].slice(0, 50));
    setHistoryIndex(-1);

    // Show command in output
    appendOutput(`$ ${command}`, 'command');

    // Process command
    if (command === 'clear') {
      setOutput([]);
      return;
    }

    if (command === 'exit' || command === 'quit') {
      appendOutput('Exiting simulator...', 'normal');
      setTimeout(() => router.push('/'), 500);
      return;
    }

    if (command === 'help') {
      appendOutput('Available commands:', 'normal');
      appendOutput('  help     - Show this help message', 'normal');
      appendOutput('  clear    - Clear the terminal', 'normal');
      appendOutput('  exit     - Return to the editor', 'normal');
      appendOutput('  list     - List all available commands', 'normal');
      appendOutput('  tree     - Show command structure', 'normal');

      if (config && config.commands.length > 0) {
        appendOutput('\nTool commands:', 'normal');
        config.commands.forEach(cmd => {
          appendOutput(`  ${cmd.name.toLowerCase()}    - ${cmd.name} command`, 'normal');
        });
      }
      return;
    }

    if (command === 'list') {
      if (config && config.commands.length > 0) {
        appendOutput('Available commands:', 'normal');
        config.commands.forEach(cmd => {
          appendOutput(`  ${cmd.name.toLowerCase()}`, 'normal');
        });
      } else {
        appendOutput('No commands available', 'error');
      }
      return;
    }

    if (command === 'tree') {
      setShowCommandTree(true);
      return;
    }

    // Try to match to a config command
    if (config) {
      const cmdName = command.split(' ')[0].toLowerCase();
      const matchedCommand = config.commands.find(
        cmd => cmd.name.toLowerCase() === cmdName
      );

      if (matchedCommand) {
        appendOutput(`Executing ${matchedCommand.name}...`, 'normal');

        // Simple mock execution
        if (typeof matchedCommand.execute === 'string') {
          appendOutput(`Would execute: ${matchedCommand.execute}`, 'normal');
          appendOutput('Command completed successfully', 'success');
        } else if (matchedCommand.options && matchedCommand.options.length > 0) {
          // Show what options would be prompted
          appendOutput('This command would prompt for:', 'normal');
          matchedCommand.options.forEach(option => {
            appendOutput(`- ${option.message}`, 'normal');
          });
        } else if (matchedCommand.subcommands && matchedCommand.subcommands.length > 0) {
          appendOutput('Available subcommands:', 'normal');
          matchedCommand.subcommands.forEach(subcmd => {
            appendOutput(`- ${subcmd.name}`, 'normal');
          });
        }
        return;
      }
    }

    // Command not found
    appendOutput(`Command not found: ${command}`, 'error');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const command = commandLine.trim();
      setCommandLine('');
      handleCommand(command);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (inputHistory.length > 0 && historyIndex < inputHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommandLine(inputHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommandLine(inputHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommandLine('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (!config) return;

      const partialCommand = commandLine.toLowerCase();
      const commands = config.commands.map(cmd => cmd.name.toLowerCase());
      const builtInCommands = ['help', 'clear', 'exit', 'quit', 'list', 'tree'];

      const allCommands = [...commands, ...builtInCommands];
      const matches = allCommands.filter(cmd => cmd.startsWith(partialCommand));

      if (matches.length === 1) {
        setCommandLine(matches[0]);
      }
    }
  };

  const handleCloseCommandTree = () => {
    setShowCommandTree(false);
  };

  const renderCommandTree = () => {
    if (!config) return null;

    return (
      <div className={styles.commandTree}>
        <div className={styles.treeTitle}>
          Command Structure
          <button
            className={styles.backButton}
            onClick={handleCloseCommandTree}
            style={{ float: 'right', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
          >
            Close
          </button>
        </div>

        <ul className={styles.treeNode}>
          {config.commands.map((command, i) => (
            <li key={i} className={styles.commandNode}>
              <div>
                <span className={styles.nodeName}>{command.name}</span>
                <span className={styles.nodeType}>
                  {command.subcommands ? '(group)' : '(command)'}
                </span>
              </div>

              {command.execute && (
                <div className={styles.nodeExecute}>{command.execute}</div>
              )}

              {command.options && command.options.length > 0 && (
                <ul className={styles.subItems}>
                  {command.options.map((option, j) => (
                    <li key={j} className={styles.optionItem}>
                      <span className={styles.optionName}>{option.name}</span>
                      <span className={styles.optionType}> ({option.type})</span>
                      {option.message && `: ${option.message}`}
                    </li>
                  ))}
                </ul>
              )}

              {command.subcommands && command.subcommands.length > 0 && (
                <ul className={styles.subItems}>
                  {command.subcommands.map((subcmd, k) => (
                    <li key={k} className={styles.subcommandItem}>
                      <span className={styles.subcommandName}>{subcmd.name}</span>
                      {subcmd.execute && (
                        <div className={styles.nodeExecute}>{subcmd.execute}</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className={styles.simulatorContainer}>
      <div className={styles.simulatorHeader}>
        <h1>CLI Simulator</h1>
        <button className={styles.backButton} onClick={() => router.push('/')}>
          Back to Editor
        </button>
      </div>

      <div className={styles.instructions}>
        <h2>Getting Started</h2>
        <p>This simulator allows you to test and interact with the CLI commands you've configured.</p>
        <ul>
          <li>Type <code>help</code> to see available commands</li>
          <li>Use <code>list</code> to see all your custom commands</li>
          <li>Use <code>tree</code> to visualize the command structure</li>
          <li>Press <kbd>Tab</kbd> for command auto-completion</li>
          <li>Use <kbd>↑</kbd> and <kbd>↓</kbd> arrow keys to navigate command history</li>
        </ul>
      </div>

      {showCommandTree && renderCommandTree()}

      <div className={styles.terminal} ref={terminalRef}>
        {output.map((line, index) => (
          <div
            key={index}
            className={`${styles.outputLine} ${
              line.type === 'command' ? styles.commandLine : 
              line.type === 'error' ? styles.errorLine : 
              line.type === 'success' ? styles.successLine : ''
            }`}
          >
            {line.text}
          </div>
        ))}

        <div className={styles.inputLine}>
          <span className={styles.prompt}>$</span>
          <input
            ref={inputRef}
            type="text"
            value={commandLine}
            onChange={(e) => setCommandLine(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className={styles.commandInput}
            autoFocus
          />
        </div>
      </div>

      <div className={styles.simulatorFooter}>
        <p>
          Type <code>help</code> for available commands | <code>exit</code> to return to editor |
          <code>tree</code> to view command structure
        </p>
      </div>
    </div>
  );
}
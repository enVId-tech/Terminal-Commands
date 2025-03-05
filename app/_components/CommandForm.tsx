'use client';

import React, { useState, useEffect } from 'react';
import {Command, CommandOption, SubCommand} from '../types/commands';
import OptionForm from './OptionForm';
import SubCommandForm from './SubCommandForm';
import styles from '../../styles/commandform.module.scss';

interface CommandFormProps {
  command: Command;
  commandId: string;
  onUpdate: (command: Command) => void;
  onRemove: () => void;
  highlightedElement?: string | null;
}

// Extend Command interface for internal component use
interface EnhancedCommand extends Command {
  executeCommands?: string[];
  executeParallel?: boolean;
}

const CommandForm: React.FC<CommandFormProps> = (props) => {
  const { command, commandId, onUpdate, onRemove, highlightedElement } = props;
  const [activeTab, setActiveTab] = useState<'options' | 'subcommands' | 'execute'>('options');
  const enhancedCommand = command as EnhancedCommand;

  // Migrate legacy execute field if needed
  useEffect(() => {
    if (typeof command.execute === 'string' && command.execute && !enhancedCommand.executeCommands) {
      onUpdate({
        ...command,
        executeCommands: [command.execute],
        execute: undefined // Remove legacy field
      } as EnhancedCommand);
    } else if (!enhancedCommand.executeCommands) {
      onUpdate({
        ...command,
        executeCommands: ['']
      } as EnhancedCommand);
    }
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...command, name: e.target.value });
  };

  const addOption = () => {
    const options = command.options ? [...command.options] : [];
    options.push({
      type: 'input',
      name: '',
      message: ''
    });
    onUpdate({ ...command, options });
  };

  const updateOption = (index: number, updatedOption: CommandOption) => {
    if (!command.options) return;
    const options = [...command.options];
    options[index] = updatedOption;
    onUpdate({ ...command, options });
  };

  const removeOption = (index: number) => {
    if (!command.options) return;
    const options = [...command.options];
    options.splice(index, 1);
    onUpdate({ ...command, options });
  };

  const addSubcommand = () => {
    const subcommands = command.subcommands ? [...command.subcommands] : [];
    subcommands.push({
      name: 'New Subcommand',
      executeCommands: ['']
    });
    onUpdate({ ...command, subcommands });
  };

  const updateSubcommand = (index: number, updatedSubcommand: SubCommand) => {
    if (!command.subcommands) return;
    const subcommands = [...command.subcommands];
    subcommands[index] = updatedSubcommand;
    onUpdate({ ...command, subcommands });
  };

  const removeSubcommand = (index: number) => {
    if (!command.subcommands) return;
    const subcommands = [...command.subcommands];
    subcommands.splice(index, 1);
    onUpdate({ ...command, subcommands });
  };

  const addExecuteCommand = () => {
    const executeCommands = [...(enhancedCommand.executeCommands || []), ''];
    onUpdate({ ...command, executeCommands } as EnhancedCommand);
  };

  const updateExecuteCommand = (index: number, value: string) => {
    const executeCommands = [...(enhancedCommand.executeCommands || [])];
    executeCommands[index] = value;
    onUpdate({ ...command, executeCommands } as EnhancedCommand);
  };

  const removeExecuteCommand = (index: number) => {
    const executeCommands = [...(enhancedCommand.executeCommands || [])];
    executeCommands.splice(index, 1);
    onUpdate({ ...command, executeCommands } as EnhancedCommand);
  };

  const toggleExecuteParallel = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...command,
      executeParallel: e.target.checked
    } as EnhancedCommand);
  };

  // Check if command has subcommands
  const hasSubcommands = command.subcommands && command.subcommands.length > 0;

  return (
      <div className={styles.commandForm}>
        <div className={styles.formSection}>
          <label className={styles.sectionTitle}>
            Command Name:
          </label>
          <input
              type="text"
              value={command.name}
              onChange={handleNameChange}
              placeholder="e.g. Build"
              className={styles.nameInput}
          />
        </div>

        <div className={styles.tabs}>
          <div
              onClick={() => setActiveTab('options')}
              className={`${styles.tab} ${activeTab === 'options' ? styles.active : ''}`}
          >
            Options
          </div>
          <div
              onClick={() => setActiveTab('subcommands')}
              className={`${styles.tab} ${activeTab === 'subcommands' ? styles.active : ''}`}
          >
            Subcommands
          </div>
          <div
              onClick={() => setActiveTab('execute')}
              className={`${styles.tab} ${activeTab === 'execute' ? styles.active : ''}`}
          >
            Execute
          </div>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'options' && (
              <div className={styles.formSection}>
                {command.options?.map((option, index) => (
                    <div
                        key={`option-${index}`}
                        className={`${styles.itemContainer} ${highlightedElement === `${commandId}-option-${index}` ? styles.highlighted : ''}`}
                        data-id={`${commandId}-option-${index}`}
                    >
                      <OptionForm
                          option={option}
                          onUpdate={(updatedOption) => updateOption(index, updatedOption)}
                          onRemove={() => removeOption(index)}
                          highlightedElement={highlightedElement}
                      />
                    </div>
                ))}

                <button onClick={addOption} className={styles.button}>
                  Add Option
                </button>
              </div>
          )}

          {activeTab === 'subcommands' && (
              <div className={styles.formSection}>
                {command.subcommands?.map((subcommand, index) => (
                    <div
                        key={`subcommand-${index}`}
                        className={`${styles.itemContainer} ${highlightedElement === `${commandId}-subcommands-subcommand-${index}` ? styles.highlighted : ''}`}
                        data-id={`${commandId}-subcommands-subcommand-${index}`}
                    >
                      <SubCommandForm
                          subcommand={subcommand}
                          subcommandId={`${commandId}-subcommands-subcommand-${index}`}
                          onUpdate={(updatedSubcommand) => updateSubcommand(index, updatedSubcommand)}
                          onRemove={() => removeSubcommand(index)}
                          highlightedElement={highlightedElement}
                      />
                    </div>
                ))}

                <button onClick={addSubcommand} className={styles.button}>
                  Add Subcommand
                </button>
              </div>
          )}

          {activeTab === 'execute' && (
              <div className={styles.formSection}>
                <label className={styles.sectionTitle}>
                  Execute Commands:
                </label>

                <div className={styles.checkboxContainer}>
                  <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={enhancedCommand.executeParallel || false}
                        onChange={toggleExecuteParallel}
                        className={styles.checkbox}
                    />
                    <span>Execute commands in parallel</span>
                  </label>
                </div>

                <div className={styles.executeCommandsList}>
                  {(enhancedCommand.executeCommands || []).map((cmd, index) => (
                      <div
                          key={`cmd-${index}`}
                          className={`${styles.executeCommandItem} ${highlightedElement === `${commandId}-execute-${index}` ? styles.highlighted : ''}`}
                          data-id={`${commandId}-execute-${index}`}
                      >
                        <input
                            type="text"
                            value={cmd}
                            onChange={(e) => updateExecuteCommand(index, e.target.value)}
                            placeholder="npm run build -- --env={{buildType}}"
                            className={styles.nameInput}
                        />
                        <button
                            onClick={() => removeExecuteCommand(index)}
                            className={styles.dangerButton}
                        >
                          Remove
                        </button>
                      </div>
                  ))}
                </div>

                <button
                    onClick={addExecuteCommand}
                    className={styles.button}
                >
                  Add Command
                </button>

                {hasSubcommands && (
                    <div className={styles.helpText}>
                      These commands will run before executing subcommands
                    </div>
                )}

                <div className={styles.helpText}>
                  Use Handlebars syntax for variables: <code>{'{{variable}}'}</code> and conditions: <code>{'{{#if condition}}...{{/if}}'}</code>
                </div>
              </div>
          )}
        </div>

        <div className={styles.actionButtons}>
          <button onClick={onRemove} className={styles.dangerButton}>
            Remove Command
          </button>
        </div>
      </div>
  );
};

export default CommandForm;
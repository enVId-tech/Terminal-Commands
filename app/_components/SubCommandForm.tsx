'use client';

import React, { useState, useEffect } from 'react';
import OptionForm from './OptionForm';
import styles from '../../styles/commandform.module.scss';
import { CommandOption, SubCommand } from "@/app/types/commands";

interface SubCommandFormProps {
  subcommand: SubCommand;
  subcommandId: string;
  onUpdate: (subcommand: SubCommand) => void;
  onRemove: () => void;
  highlightedElement?: string | null;
}

// Extend subcommand interface for internal component use
interface EnhancedSubcommand extends SubCommand {
  name: string;
  options?: CommandOption[];
  execute?: string | Record<string, string>;
  executeCommands?: string[];
  executeParallel?: boolean;
  subcommands?: SubCommand[];
}

const SubCommandForm: React.FC<SubCommandFormProps> = (props) => {
  const { subcommand, subcommandId, onUpdate, onRemove, highlightedElement } = props;
  const enhancedSubcommand = subcommand as EnhancedSubcommand;
  const [activeTab, setActiveTab] = useState<'options' | 'execute' | 'subcommands'>('options');

  // Migrate legacy execute field if needed
  useEffect(() => {
    if (typeof subcommand.execute === 'string' && subcommand.execute && !enhancedSubcommand.executeCommands) {
      onUpdate({
        ...subcommand,
        executeCommands: [subcommand.execute],
        execute: undefined // Remove legacy field
      });
    } else if (!enhancedSubcommand.executeCommands && typeof subcommand.execute !== 'object') {
      onUpdate({
        ...subcommand,
        executeCommands: ['']
      });
    }
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...subcommand, name: e.target.value });
  };

  // Options management
  const addOption = () => {
    const options = subcommand.options ? [...subcommand.options] : [];
    options.push({
      type: 'input',
      name: '',
      message: ''
    });
    onUpdate({ ...subcommand, options });
  };

  const updateOption = (index: number, updatedOption: CommandOption) => {
    const options = [...(subcommand.options || [])];
    options[index] = updatedOption;
    onUpdate({ ...subcommand, options });
  };

  const removeOption = (index: number) => {
    const options = [...(subcommand.options || [])];
    options.splice(index, 1);
    onUpdate({ ...subcommand, options });
  };

  // Execute commands management
  const addExecuteCommand = () => {
    const executeCommands = [...(enhancedSubcommand.executeCommands || []), ''];
    onUpdate({
      ...subcommand,
      executeCommands,
      execute: undefined // Remove legacy field if adding new commands
    });
  };

  const updateExecuteCommand = (index: number, value: string) => {
    const executeCommands = [...(enhancedSubcommand.executeCommands || [])];
    executeCommands[index] = value;
    onUpdate({ ...subcommand, executeCommands });
  };

  const removeExecuteCommand = (index: number) => {
    const executeCommands = [...(enhancedSubcommand.executeCommands || [])];
    executeCommands.splice(index, 1);
    onUpdate({ ...subcommand, executeCommands });
  };

  const toggleExecuteParallel = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...subcommand,
      executeParallel: e.target.checked
    });
  };

  // Nested subcommands management
  const addNestedSubcommand = () => {
    const subcommands = subcommand.subcommands ? [...subcommand.subcommands] : [];
    subcommands.push({
      name: 'New Nested Subcommand',
      executeCommands: ['']
    });
    onUpdate({ ...subcommand, subcommands });
  };

  const updateNestedSubcommand = (index: number, updatedSubcommand: SubCommand) => {
    if (!subcommand.subcommands) return;
    const subcommands = [...subcommand.subcommands];
    subcommands[index] = updatedSubcommand;
    onUpdate({ ...subcommand, subcommands });
  };

  const removeNestedSubcommand = (index: number) => {
    if (!subcommand.subcommands) return;
    const subcommands = [...subcommand.subcommands];
    subcommands.splice(index, 1);
    onUpdate({ ...subcommand, subcommands });
  };

  // Check if subcommand has nested subcommands
  const hasNestedSubcommands = subcommand.subcommands && subcommand.subcommands.length > 0;

  return (
      <div className={styles.commandForm}>
        <div className={styles.formSection}>
          <label className={styles.sectionTitle}>
            Subcommand Name:
          </label>
          <input
              type="text"
              value={subcommand.name}
              onChange={handleNameChange}
              placeholder="e.g. Dev Build"
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
            Nested Subcommands
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
                {subcommand.options?.map((option: CommandOption, index: number) => (
                    <div
                        key={`option-${index}`}
                        className={`${styles.itemContainer} ${highlightedElement === `${subcommandId}-option-${index}` ? styles.highlighted : ''}`}
                        data-id={`${subcommandId}-option-${index}`}
                    >
                      <OptionForm
                          option={option}
                          optionId={`${subcommandId}-option-${index}`}
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
                {subcommand.subcommands?.map((nestedSubcommand, index) => (
                    <div
                        key={`nested-subcommand-${index}`}
                        className={`${styles.itemContainer} ${highlightedElement === `${subcommandId}-subcommands-subcommand-${index}` ? styles.highlighted : ''}`}
                        data-id={`${subcommandId}-subcommands-subcommand-${index}`}
                    >
                      <SubCommandForm
                          subcommand={nestedSubcommand}
                          subcommandId={`${subcommandId}-subcommands-subcommand-${index}`}
                          onUpdate={(updatedSubcommand) => updateNestedSubcommand(index, updatedSubcommand)}
                          onRemove={() => removeNestedSubcommand(index)}
                          highlightedElement={highlightedElement}
                      />
                    </div>
                ))}

                <button onClick={addNestedSubcommand} className={styles.button}>
                  Add Nested Subcommand
                </button>
              </div>
          )}

          {activeTab === 'execute' && (
              <div className={styles.formSection}>
                <label className={styles.sectionTitle}>
                  Execute Commands:
                </label>

                {typeof subcommand.execute === 'object' ? (
                    <div className={styles.helpText}>
                      This subcommand is using dynamic execution based on option values.
                      Please convert to standard execution to use multiple commands.
                    </div>
                ) : (
                    <>
                      <div className={styles.checkboxContainer}>
                        <label className={styles.checkboxLabel}>
                          <input
                              type="checkbox"
                              checked={enhancedSubcommand.executeParallel || false}
                              onChange={toggleExecuteParallel}
                              className={styles.checkbox}
                          />
                          <span>Execute commands in parallel</span>
                        </label>
                      </div>

                      <div className={styles.executeCommandsList}>
                        {(enhancedSubcommand.executeCommands || []).map((cmd, index) => (
                            <div
                                key={`cmd-${index}`}
                                className={styles.executeCommandItem}
                                data-id={`${subcommandId}-execute-${index}`}
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

                      {hasNestedSubcommands && (
                          <div className={styles.helpText}>
                            These commands will run before executing nested subcommands
                          </div>
                      )}

                      <div className={styles.helpText}>
                        Use Handlebars syntax for variables: <code>{'{{variable}}'}</code> and conditions: <code>{'{{#if condition}}...{{/if}}'}</code>
                      </div>
                    </>
                )}
              </div>
          )}
        </div>

        <div className={styles.actionButtons}>
          <button onClick={onRemove} className={styles.dangerButton}>
            Remove Subcommand
          </button>
        </div>
      </div>
  );
};

export default SubCommandForm;
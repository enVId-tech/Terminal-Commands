'use client';

import React, { useState, useEffect } from 'react';
import {Command, CommandOption, SubCommand} from '../types/commands';
import OptionForm from './OptionForm';
import SubCommandForm from './SubCommandForm';
import styles from '../../styles/commandform.module.scss';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';


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
  const [isDragging, setIsDragging] = useState<boolean>(false);

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

  const handleDragEnd = (result: any) => {
    setIsDragging(false);

    const { source, destination, type } = result;

    // If dropped outside a droppable area or in same position
    if (!destination ||
        (source.index === destination.index &&
            source.droppableId === destination.droppableId)) {
      return;
    }

    // Use setTimeout to delay state updates
    setTimeout(() => {
      // Handle options reordering
      if (type === 'options') {
        const options = [...(command.options || [])];
        const [removed] = options.splice(source.index, 1);
        options.splice(destination.index, 0, removed);
        onUpdate({ ...command, options });
      }

      // Handle subcommands reordering
      else if (type === 'subcommands') {
        const subcommands = [...(command.subcommands || [])];
        const [removed] = subcommands.splice(source.index, 1);
        subcommands.splice(destination.index, 0, removed);
        onUpdate({ ...command, subcommands });
      }

      // Handle execute commands reordering
      else if (type === 'execute-commands') {
        const executeCommands = [...(enhancedCommand.executeCommands || [])];
        const [removed] = executeCommands.splice(source.index, 1);
        executeCommands.splice(destination.index, 0, removed);
        onUpdate({ ...command, executeCommands });
      }
    }, 0);
  };

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
        <DragDropContext
            onDragEnd={handleDragEnd}
            onDragStart={() => setIsDragging(true)}
        >
          <div className={styles.tabContent}>
            {activeTab === 'options' && (
                <div className={styles.formSection}>
                  <Droppable
                      droppableId={`${commandId}-options`}
                      type="options"
                      isCombineEnabled={false}
                      ignoreContainerClipping={false}
                  >
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                          {command.options?.map((option, index) => (
                              <Draggable
                                  key={`option-${index}`}
                                  draggableId={`${commandId}-option-${index}`}
                                  index={index}
                              >
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`
                              ${styles.itemContainer} 
                              ${highlightedElement === `${commandId}-option-${index}` ? styles.highlighted : ''}
                              ${snapshot.isDragging ? styles.dragging : ''}
                            `}
                                        data-id={`${commandId}-option-${index}`}
                                    >
                                      <div className={styles.dragHandleArea} {...provided.dragHandleProps}>
                                        <span className={styles.dragHandle}>⠿</span>
                                      </div>
                                      <OptionForm
                                          option={option}
                                          optionId={`${commandId}-option-${index}`}
                                          onUpdate={(updatedOption) => updateOption(index, updatedOption)}
                                          onRemove={() => removeOption(index)}
                                          highlightedElement={highlightedElement}
                                      />
                                    </div>
                                )}
                              </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                    )}
                  </Droppable>

                  <button onClick={addOption} className={styles.button}>
                    Add Option
                  </button>
                </div>
            )}

            {activeTab === 'subcommands' && (
                <div className={styles.formSection}>
                  <Droppable
                      droppableId={`${commandId}-subcommands`}
                      type="subcommands"
                      isCombineEnabled={false}
                      ignoreContainerClipping={false}
                  >
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                          {command.subcommands?.map((subcommand, index) => (
                              <Draggable
                                  key={`subcommand-${index}`}
                                  draggableId={`${commandId}-subcommand-${index}`}
                                  index={index}
                              >
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`
                              ${styles.itemContainer} 
                              ${highlightedElement === `${commandId}-subcommands-subcommand-${index}` ? styles.highlighted : ''}
                              ${snapshot.isDragging ? styles.dragging : ''}
                            `}
                                        data-id={`${commandId}-subcommands-subcommand-${index}`}
                                    >
                                      <div className={styles.dragHandleArea} {...provided.dragHandleProps}>
                                        <span className={styles.dragHandle}>⠿</span>
                                      </div>
                                      <SubCommandForm
                                          subcommand={subcommand}
                                          subcommandId={`${commandId}-subcommands-subcommand-${index}`}
                                          onUpdate={(updatedSubcommand) => updateSubcommand(index, updatedSubcommand)}
                                          onRemove={() => removeSubcommand(index)}
                                          highlightedElement={highlightedElement}
                                      />
                                    </div>
                                )}
                              </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                    )}
                  </Droppable>

                  <button onClick={addSubcommand} className={styles.button}>
                    Add Subcommand
                  </button>
                </div>
            )}

            {activeTab === 'execute' && (
                <div className={styles.formSection}>
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

                  {/* Add language selector */}
                  <div className={styles.languageSelector}>
                    <label className={styles.sectionTitle}>Command Language:</label>
                    <select
                        value={enhancedCommand.language || 'default'}
                        onChange={(e) => onUpdate({ ...command, language: e.target.value })}
                        className={styles.selectInput}
                    >
                      <option value="default">Default (Shell)</option>
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="cpp">C++</option>
                      <option value="csharp">C#</option>
                      <option value="java">Java</option>
                      <option value="kotlin">Kotlin</option>
                    </select>
                  </div>

                  <Droppable droppableId={`${commandId}-execute-commands`} type="execute-commands">
                    {(provided) => (
                        <div
                            className={styles.executeCommandsList}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                          {(enhancedCommand.executeCommands || []).map((cmd, index) => (
                              <Draggable
                                  key={`cmd-${index}`}
                                  draggableId={`${commandId}-execute-${index}`}
                                  index={index}
                              >
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`
                      ${styles.executeCommandItem} 
                      ${snapshot.isDragging ? styles.dragging : ''}
                    `}
                                        data-id={`${commandId}-execute-${index}`}
                                    >
                                      <div className={styles.dragHandleArea} {...provided.dragHandleProps}>
                                        <span className={styles.dragHandle}>⠿</span>
                                      </div>
                                      <textarea
                                          value={cmd}
                                          onChange={(e) => updateExecuteCommand(index, e.target.value)}
                                          placeholder="npm run build -- --env={{buildType}}"
                                          className={styles.commandTextArea}
                                          rows={Math.max(3, cmd.split('\n').length)}
                                      />
                                      <button
                                          onClick={() => removeExecuteCommand(index)}
                                          className={styles.dangerButton}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                )}
                              </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                    )}
                  </Droppable>

                  <button onClick={addExecuteCommand} className={styles.button}>
                    Add Command
                  </button>

                  <div className={styles.helpText}>
                    <p>Use Handlebars syntax for variables: <code>{'{{variable}}'}</code> and conditions: <code>{'{{#if condition}}...{{/if}}'}</code></p>
                    <p>Multiline commands are supported. Use language selection for code snippets in different languages.</p>
                  </div>
                </div>
            )}
          </div>
        </DragDropContext>

        <div className={styles.actionButtons}>
          <button onClick={onRemove} className={styles.dangerButton}>
            Remove Command
          </button>
        </div>
      </div>
  );
};

export default CommandForm;
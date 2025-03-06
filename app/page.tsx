// app/page.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import CommandForm from './_components/CommandForm';
import {Command, CommandConfig, CommandOption, SubCommand} from './types/commands';
import styles from '@/styles/home.module.scss';
import { useRouter } from 'next/navigation';
import yaml from 'js-yaml';

export default function Home() {
  const [config, setConfig] = useState<CommandConfig>({ commands: [] });
  const [tempConfig, setTempConfig] = useState<CommandConfig>({ commands: [] });
  const [isLoading, setIsLoading] = useState(true);
  // const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('editor');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [configFormat, setConfigFormat] = useState<'json' | 'yaml'>('yaml');
  // const [saveLocalPath, setSaveLocalPath] = useState<string>('./data');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [selectedCommand, setSelectedCommand] = useState<number | null>(null);
  const [rawConfigValid, setRawConfigValid] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    const loadCommands = async () => {
      try {
        const response = await fetch('/api/commands');
        if (!response.ok) throw new Error('Failed to load commands');

        const data = await response.json();
        setConfig(data);
        setTempConfig(data);

        // Detect format based on the file extension in the response
        if (response.headers.get('X-Config-Format')) {
          setConfigFormat(response.headers.get('X-Config-Format') as 'json' | 'yaml');
        }
      } catch (error) {
        console.error('Error loading commands:', error);
        setErrorMessage('Failed to load commands. Using example template.');
        loadExampleCommands();
      } finally {
        setIsLoading(false);
      }
    };

    loadCommands();
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    handleFile(file);
  };

// Add a helper function to handle the file
  const handleFile = (file: File) => {
    // Check if it's a JSON or YAML file
    if (!file.name.toLowerCase().match(/\.(json|ya?ml)$/)) {
      setErrorMessage('Only JSON, YAML or YML files are supported');
      return;
    }

    // Set format based on file extension
    if (file.name.toLowerCase().endsWith('.yaml') || file.name.toLowerCase().endsWith('.yml')) {
      setConfigFormat('yaml');
    } else {
      setConfigFormat('json');
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        // For YAML files, we need to send to API for parsing
        if (configFormat === 'yaml') {
          const response = await fetch('/api/commands/parse', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: event.target?.result
          });

          if (!response.ok) throw new Error('Failed to parse YAML');
          const importedConfig = await response.json();
          setConfig(importedConfig);
          setTempConfig(importedConfig);
        } else {
          // For JSON files, parse directly
          const importedConfig = JSON.parse(event.target?.result as string);
          setConfig(importedConfig);
          setTempConfig(importedConfig);
        }

        setSuccessMessage('Configuration imported successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        console.error('Error parsing file:', error);
        setErrorMessage(`Invalid ${configFormat.toUpperCase()} file format`);
        setTimeout(() => setErrorMessage(null), 3000);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Error reading file');
    };
    reader.readAsText(file);
  };

// In your page.tsx file, modify the navigateToElement function
  const navigateToElement = (commandIndex: number, path: string[] = []) => {
    // First, make sure we're in the editor tab
    setActiveTab('editor');

    // Select the command
    selectCommand(commandIndex);

    console.log(`Navigating to command #${commandIndex} with path:`, path);

    // Set the appropriate tab within the command/subcommand
    setTimeout(() => {
      // Find the element based on the path
      const highlightId = path.length > 0
          ? `cmd-${commandIndex}-${path.join('-')}`
          : `cmd-${commandIndex}`;

      console.log(`Looking for element with data-id="${highlightId}"`);

      // Highlight the element
      setHighlightedElement(highlightId);

      // Print all data-id attributes for debugging
      console.log("All data-id elements in DOM:",
          Array.from(document.querySelectorAll('[data-id]'))
              .map(el => el.getAttribute('data-id')));

      // More debugging
      setTimeout(() => {
        const element = document.querySelector(`[data-id="${highlightId}"]`);
        console.log(`Element found:`, element);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          console.log("Element is visible, scrolling to it");

          // Add a visual flash to make it very obvious
          element.classList.add(styles.flashHighlight);
          setTimeout(() => element.classList.remove(styles.flashHighlight), 1000);

          // Remove highlight after a few seconds
          setTimeout(() => setHighlightedElement(null), 3000);
        } else {
          console.log("Element NOT found in DOM!");
        }
      }, 500); // Increase timeout to 500ms
    }, 100); // Increase timeout to 100ms for selection to complete
  };

  const loadExampleCommands = async () => {
    try {
      // Example configuration
      const exampleConfig: CommandConfig = {
        commands: [
          {
            name: "Build Project",
            description: "Build the project with specified configuration",
            options: [
              {
                type: "list",
                name: "buildType",
                message: "Select build configuration",
                choices: ["development", "production", "staging"],
                default: "development"
              },
              {
                type: "confirm",
                name: "minify",
                message: "Minify the output?",
                default: false
              }
            ],
            executeCommands: [
              "npm run build -- --env={{buildType}} {{#if minify}}--minify{{/if}}",
              "echo Build completed for {{buildType}} environment"
            ],
            executeParallel: false,
            requireExecutionChoice: true
          },
          {
            name: "Install & Setup",
            description: "Install dependencies and setup the environment",
            executeCommands: [
              "npm install",
              "npx husky install",
              "cp .env.example .env"
            ],
            executeParallel: true,
            requireExecutionChoice: true
          },
          {
            name: "Docker Operations",
            description: "Docker-related commands",
            subcommands: [
              {
                name: "Start Containers",
                executeCommands: [
                  "docker-compose up -d",
                  "echo Docker containers started successfully"
                ],
                executeParallel: false,
                requireExecutionChoice: true
              },
              {
                name: "Database Setup",
                options: [
                  {
                    type: "list",
                    name: "dbType",
                    message: "Select database type",
                    choices: ["mysql", "postgres", "mongodb"],
                    default: "postgres"
                  },
                  {
                    type: "input",
                    name: "dbName",
                    message: "Enter database name",
                    default: "myapp"
                  }
                ],
                executeCommands: [
                  "docker run -d --name {{dbName}} {{dbType}}",
                  "echo Database {{dbName}} initialized with {{dbType}}"
                ],
                postExecuteCommands: [
                  "echo Database setup complete"
                ],
                postExecuteParallel: false
              }
            ]
          }
        ]
      };

      setConfig(exampleConfig);
      setTempConfig(exampleConfig);
    } catch (error) {
      console.error('Error setting up example commands:', error);
    }
  };

  // const handleSave = async () => {
  //   setIsSaving(true);
  //   setErrorMessage(null);
  //   setSuccessMessage(null);
  //
  //   try {
  //     const response = await fetch('/api/commands', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'X-Config-Format': configFormat,
  //         'X-Save-Path': saveLocalPath
  //       },
  //       body: JSON.stringify(config)
  //     });
  //
  //     if (!response.ok) throw new Error('Failed to save commands');
  //
  //     setSuccessMessage(`Configuration saved successfully to ${saveLocalPath}/commands.${configFormat}`);
  //     setTimeout(() => setSuccessMessage(null), 3000);
  //   } catch (error) {
  //     console.error('Error saving commands:', error);
  //     setErrorMessage('Failed to save commands');
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  const addCommand = () => {
    const newCommand: Command = {
      name: 'New Command',
      description: 'Description for the new command',
      executeCommands: [''],
      executeParallel: false,
      requireExecutionChoice: false
    };
    setConfig({ ...config, commands: [...config.commands, newCommand] });
  };

  const updateCommand = (index: number, updatedCommand: Command) => {
    const commands = [...config.commands];
    commands[index] = updatedCommand;
    setConfig({ ...config, commands });
  };

  const removeCommand = (index: number) => {
    const commands = [...config.commands];
    commands.splice(index, 1);
    setConfig({ ...config, commands });
    if (selectedCommand === index) {
      setSelectedCommand(null);
    }
  };

  const handleRawDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const rawText = e.target.value;
      let newConfig;

      if (configFormat === 'yaml') {
        newConfig = yaml.load(rawText) as CommandConfig;
      } else {
        newConfig = JSON.parse(rawText);
      }

      // Validate the structure
      if (!newConfig || !Array.isArray(newConfig.commands)) {
        throw new Error('Invalid configuration format');
      }

      setTempConfig(newConfig);
      setErrorMessage(null);
      setRawConfigValid(true);
    } catch (error) {
      setErrorMessage(`Invalid ${configFormat.toUpperCase()} format`);
      setRawConfigValid(false);
      console.error(error);
    }
  };

  const applyRawChanges = () => {
    if (rawConfigValid) {
      setConfig(tempConfig);
      setSuccessMessage('Changes applied successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const cancelRawChanges = () => {
    setTempConfig(config);
    setErrorMessage(null);
    setRawConfigValid(true);
    setSuccessMessage('Changes discarded');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleFile(file);

    // Reset the file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportConfig = () => {
    let configData: string;
    let mimeType: string;
    let filename: string;

    if (configFormat === 'yaml') {
      configData = yaml.dump(config);
      mimeType = 'application/yaml';
      filename = 'commands.yaml';
    } else {
      configData = JSON.stringify(config, null, 2);
      mimeType = 'application/json';
      filename = 'commands.json';
    }

    const blob = new Blob([configData], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadExampleConfig = async () => {
    setIsLoading(true);
    await loadExampleCommands();
    setSuccessMessage('Example configuration loaded');
    setTimeout(() => setSuccessMessage(null), 3000);
    setIsLoading(false);
  };

  const toggleConfigFormat = () => {
    setConfigFormat(prevFormat => prevFormat === 'json' ? 'yaml' : 'json');
  };

  // const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setSaveLocalPath(e.target.value);
  // };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const selectCommand = (index: number) => {
    setSelectedCommand(index);
  };

  if (isLoading) {
    return (
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading commands...</p>
          </div>
        </div>
    );
  }

// Updated renderSelectionTree function
  const renderSelectionTree = () => {
    if (config.commands.length === 0) {
      return <p>No commands defined</p>;
    }

    // Helper function to recursively render subcommands and their nested subcommands
    const renderSubcommands = (
        subcommands: SubCommand[],
        commandIndex: number,
        parentPath: string[] = []
    ) => {
      return (
          <ul className={styles.subcommandsList}>
            {subcommands.map((subcmd, subcmdIdx) => {
              const currentPath = [...parentPath, `subcommand-${subcmdIdx}`];
              return (
                  <li key={subcmdIdx} className={styles.subcommandItem}>
                    <div
                        className={styles.subcommandNode}
                        onClick={() => navigateToElement(commandIndex, currentPath)}
                    >
                      {subcmd.name}
                    </div>
                    {subcmd.options && subcmd.options.length > 0 && (
                        <ul className={styles.optionsList}>
                          {subcmd.options.map((opt, optIdx) => {
                            const optionPath = [...currentPath, `option-${optIdx}`];
                            return (
                                <li key={optIdx} className={styles.optionItem}>
                        <span
                            className={styles.optionLabel}
                            onClick={() => navigateToElement(commandIndex, optionPath)}
                        >
                          {opt.name || 'Unnamed option'} ({opt.type})
                        </span>
                                  {renderOptionDetails(opt)}
                                </li>
                            );
                          })}
                        </ul>
                    )}
                    {subcmd.subcommands && subcmd.subcommands.length > 0 &&
                        renderSubcommands(subcmd.subcommands, commandIndex, [...currentPath, 'subcommands'])}
                  </li>
              );
            })}
          </ul>
      );
    };

    // Helper function for rendering option details
    const renderOptionDetails = (opt: CommandOption) => {
      return (
          <>
            {opt.type === 'list' && opt.choices && (
                <ul className={styles.choicesList}>
                  {opt.choices.map((choice, choiceIdx) => (
                      <li key={choiceIdx} className={styles.choiceItem}>
                        {choice} {opt.default === choice && <span className={styles.defaultBadge}>Default</span>}
                      </li>
                  ))}
                </ul>
            )}
            {opt.type === 'confirm' && (
                <span className={styles.defaultValue}>
            Default: {opt.default ? 'Yes' : 'No'}
          </span>
            )}
            {opt.type !== 'list' && opt.type !== 'confirm' && opt.default && (
                <span className={styles.defaultValue}>
            Default: {opt.default}
          </span>
            )}
          </>
      );
    };

    return (
        <div className={styles.selectionTree}>
          <h3>Command Selection Tree</h3>
          <ul className={styles.treeList}>
            {config.commands.map((cmd, idx) => (
                <li key={idx} className={styles.treeItem}>
                  <div
                      className={styles.treeNode}
                      onClick={() => navigateToElement(idx)}
                  >
                    {cmd.name}
                  </div>
                  {cmd.options && cmd.options.length > 0 && (
                      <ul className={styles.optionsList}>
                        {cmd.options.map((opt, optIdx) => (
                            <li key={optIdx} className={styles.optionItem}>
                    <span
                        className={styles.optionLabel}
                        onClick={() => navigateToElement(idx, [`option-${optIdx}`])}
                    >
                      {opt.name || 'Unnamed option'} ({opt.type})
                    </span>
                              {renderOptionDetails(opt)}
                            </li>
                        ))}
                      </ul>
                  )}
                  {cmd.subcommands && cmd.subcommands.length > 0 &&
                      renderSubcommands(cmd.subcommands, idx, ["subcommands"])}
                </li>
            ))}
          </ul>
        </div>
    );
  };

  return (
      <div
          className={styles.container}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
      >
        {isDragging && (
            <div className={styles.dragOverlay}>
              <div className={styles.dropZone}>
                <div className={styles.dropIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </div>
                <p>Drop your config file here</p>
                <span className={styles.supportedFormats}>.json, .yaml, .yml</span>
              </div>
            </div>
        )}
        <div className={styles.header}>
          <h1 className={styles.heading}>CLI Command Builder</h1>
          <div className={styles.headerButtons}>
            <button
                className={styles.actionButton}
                onClick={() => router.push('/documentation')}
            >
              Documentation
            </button>
            <button
                className={styles.saveButton}
                // onClick={handleSave}
                // disabled={isSaving}
                onClick={handleExportConfig}
            >
              Export Configuration
              {/*{isSaving ? 'Saving...' : 'Export Configuration'}*/}
            </button>
          </div>
        </div>

        {errorMessage && (
            <div className={styles.errorMessage}>
              {errorMessage}
              <button
                  className={styles.closeButton}
                  onClick={() => setErrorMessage(null)}
              >
                ×
              </button>
            </div>
        )}

        {successMessage && (
            <div className={styles.successMessage}>
              {successMessage}
              <button
                  className={styles.closeButton}
                  onClick={() => setSuccessMessage(null)}
              >
                ×
              </button>
            </div>
        )}

        <div className={styles.importExportSection}>
          <h2>Configuration Management</h2>
          <div className={styles.buttonGroup}>
            <button className={styles.button} onClick={handleImportClick}>
              Import Config
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".json,.yml,.yaml"
                style={{display: 'none'}}
            />
            <button className={styles.button} onClick={handleExportConfig}>
              Export Config
            </button>
            <button className={styles.button} onClick={handleLoadExampleConfig}>
              Load Example Config
            </button>
            <button className={styles.button} onClick={toggleConfigFormat}>
              Format: {configFormat.toUpperCase()}
            </button>
            <button className={styles.button} onClick={togglePreview}>
              {showPreview ? 'Hide' : 'Show'} Selection Tree
            </button>
            <button className={styles.button} onClick={() => setConfig({commands: []})}>
              Clear Selection
            </button>
          </div>

          {/*  <div className={styles.savePath}>*/}
          {/*    <label htmlFor="savePath">Local Save Path:</label>*/}
          {/*    <input*/}
          {/*        type="text"*/}
          {/*        id="savePath"*/}
          {/*        value={saveLocalPath}*/}
          {/*        onChange={handlePathChange}*/}
          {/*        placeholder="./data"*/}
          {/*    />*/}
          {/*  </div>*/}
        </div>

        {showPreview && (
            <div className={styles.previewSection}>
              {renderSelectionTree()}
            </div>
        )}

        <div className={styles.tabs}>
          <div
              onClick={() => setActiveTab('editor')}
              className={`${styles.tab} ${activeTab === 'editor' ? styles.active : ''}`}
          >
            Visual Editor
          </div>
          <div
              onClick={() => setActiveTab('raw')}
              className={`${styles.tab} ${activeTab === 'raw' ? styles.active : ''}`}
          >
            Raw {configFormat.toUpperCase()}
          </div>
        </div>

        {activeTab === 'editor' && (
            <div className={styles.box}>
              <p className={styles.description}>
                Build interactive command-line interfaces with easy-to-use forms.
                Your commands will be saved as <code>commands.{configFormat}</code>.
              </p>

              {config.commands.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No commands have been created yet.</p>
                    <button className={styles.button} onClick={addCommand}>
                      Create Your First Command
                    </button>
                    <p className={styles.emptyStateHelp}>
                      You can also load example configurations using the &#34;Load Example Config&#34; button above.
                    </p>
                  </div>
              ) : (
                  <div className={styles.commandList}>
                    <div className={styles.commandSidebar}>
                      {config.commands.map((command, index) => (
                          <div
                              key={`command-item-${index}`}
                              className={`${styles.commandItem} ${selectedCommand === index ? styles.selectedCommand : ''}`}
                              onClick={() => selectCommand(index)}
                          >
                            {command.name}
                          </div>
                      ))}
                      <button className={styles.addCommandButton} onClick={addCommand}>
                        + Add Command
                      </button>
                    </div>

                    <div className={styles.commandEditor}>
                      {selectedCommand !== null ? (
                          <div className={styles.commandBox}>
                            <CommandForm
                                command={config.commands[selectedCommand]}
                                commandId={`cmd-${selectedCommand}`}
                                onUpdate={(updatedCommand) => updateCommand(selectedCommand, updatedCommand)}
                                onRemove={() => removeCommand(selectedCommand)}
                                highlightedElement={highlightedElement}
                            />
                          </div>
                      ) : (
                          <div className={styles.noCommandSelected}>
                            <p>Select a command from the list or create a new one</p>
                          </div>
                      )}
                    </div>
                  </div>
              )}
            </div>
        )}

        {activeTab === 'raw' && (
            <div className={styles.box}>
              <p className={styles.description}>
                Edit the raw {configFormat.toUpperCase()} configuration directly. Be careful to maintain valid format.
              </p>
              <div className={styles.rawEditorContainer}>
                <textarea
                    value={
                      configFormat === 'yaml'
                          ? yaml.dump(tempConfig)
                          : JSON.stringify(tempConfig, null, 2)
                    }
                    onChange={handleRawDataChange}
                    className={styles.rawEditor}
                />
                <div className={styles.rawEditorActions}>
                  <button
                      className={styles.applyButton}
                      onClick={applyRawChanges}
                      disabled={!rawConfigValid}
                  >
                    Apply Changes
                  </button>
                  <button
                      className={styles.cancelButton}
                      onClick={cancelRawChanges}
                  >
                    Discard Changes
                  </button>
                </div>
              </div>
            </div>
        )}

        <div className={styles.saveButtonContainer}>
          <button
              className={styles.bigSaveButton}
              // onClick={handleSave}
              onClick={handleExportConfig}
              // disabled={isSaving}
          >
            Export Configuration
            {/*{isSaving ? 'Saving...' : 'Export Configuration'}*/}
          </button>
        </div>

        <div className={styles.footer}>
          <p>Erick Tran - CLI Command Builder — Build interactive CLI tools
            with {configFormat.toUpperCase()} configuration</p>
        </div>
      </div>
  );
}
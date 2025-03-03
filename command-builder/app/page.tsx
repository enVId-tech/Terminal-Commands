// app/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import CommandForm from './_components/CommandForm';
import { Command, CommandConfig } from './types/commands';
import styles from '@/styles/home.module.scss';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [config, setConfig] = useState<CommandConfig>({ commands: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('editor');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const loadCommands = async () => {
      try {
        const response = await fetch('/api/commands');
        if (!response.ok) throw new Error('Failed to load commands');

        const data = await response.json();
        setConfig(data);
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

  const loadExampleCommands = async () => {
    try {
      const response = await fetch('/api/commands/example');
      if (!response.ok) throw new Error('Failed to load example commands');

      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error loading example commands:', error);
      // Fallback to a minimal default config
      setConfig({
        commands: [
          {
            name: "Build",
            options: [
              {
                type: "list",
                name: "buildType",
                message: "Select build configuration:",
                choices: ["Development", "Production", "Staging"]
              },
              {
                type: "confirm",
                name: "minify",
                message: "Minify the output?",
                default: false
              }
            ],
            execute: "npm run build -- --env={{buildType}} {{#if minify}}--minify{{/if}}"
          }
        ]
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (!response.ok) throw new Error('Failed to save commands');

      setSuccessMessage('Commands saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error saving commands:', error);
      setErrorMessage('Failed to save commands');
    } finally {
      setIsSaving(false);
    }
  };

  const addCommand = () => {
    const newCommand: Command = {
      name: 'New Command',
      execute: ''
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
  };

  const handleRawJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const newConfig = JSON.parse(e.target.value);
      setConfig(newConfig);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Invalid JSON format');
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedConfig = JSON.parse(event.target?.result as string);
        setConfig(importedConfig);
        setSuccessMessage('Configuration imported successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        setErrorMessage('Invalid JSON file format');
      }
    };
    reader.onerror = () => {
      setErrorMessage('Error reading file');
    };
    reader.readAsText(file);

    // Reset the file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportConfig = () => {
    const configString = JSON.stringify(config, null, 2);
    const blob = new Blob([configString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'commands.json';
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
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          Loading commands...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>CLI Command Builder</h1>
        <div className={styles.headerButtons}>
          <button
            className={styles.actionButton}
            onClick={() => router.push('/simulator')}
          >
            Open Simulator
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
          <button
            className={styles.actionButton}
            onClick={() => router.push('/documentation')}
          >
            Documentation
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className={styles.errorMessage}>
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className={styles.successMessage}>
          {successMessage}
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
            accept=".json"
            style={{ display: 'none' }}
          />
          <button className={styles.button} onClick={handleExportConfig}>
            Export Config
          </button>
          <button className={styles.button} onClick={handleLoadExampleConfig}>
            Load Example Config
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        <div
          onClick={() => setActiveTab('editor')}
          className={`${styles.tab} ${activeTab === 'editor' ? styles.active : ''}`}
        >
          Visual Editor
        </div>
        <div
          onClick={() => setActiveTab('json')}
          className={`${styles.tab} ${activeTab === 'json' ? styles.active : ''}`}
        >
          Raw JSON
        </div>
      </div>

      {activeTab === 'editor' && (
        <div className={styles.box}>
          <p className={styles.description}>
            Build interactive command-line interfaces with easy-to-use forms.
            Your commands will be saved to <code>commands.json</code>.
          </p>

          {config.commands.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No commands have been created yet.</p>
              <button className={styles.button} onClick={addCommand}>
                Create Your First Command
              </button>
              <p className={styles.emptyStateHelp}>
                You can also load a template configuration using the "Load Template" button above.
              </p>
            </div>
          ) : (
            <div className={styles.commandList}>
              {config.commands.map((command, index) => (
                <div
                  key={`command-${index}`}
                  className={styles.commandBox}
                >
                  <CommandForm
                    command={command}
                    onUpdate={(updatedCommand) => updateCommand(index, updatedCommand)}
                    onRemove={() => removeCommand(index)}
                  />
                </div>
              ))}

              <button className={styles.button} onClick={addCommand}>
                Add Command
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'json' && (
        <div className={styles.box}>
          <p className={styles.description}>
            Edit the raw JSON configuration directly. Be careful to maintain valid JSON format.
          </p>
          <textarea
            value={JSON.stringify(config, null, 2)}
            onChange={handleRawJsonChange}
            className={styles.jsonEditor}
          />
        </div>
      )}

      <div className={styles.saveButtonContainer}>
        <button
          className={styles.bigSaveButton}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className={styles.footer}>
        <p>CLI Command Builder — Build interactive CLI tools with JSON configuration</p>
      </div>
    </div>
  );
}
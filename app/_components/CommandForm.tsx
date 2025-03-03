'use client';

import React, { useState } from 'react';
import { Command } from '../types/commands';
import OptionForm from './OptionForm';
import SubCommandForm from './SubCommandForm';

interface CommandFormProps {
  command: Command;
  onUpdate: (command: Command) => void;
  onRemove: () => void;
}

const CommandForm: React.FC<CommandFormProps> = ({ command, onUpdate, onRemove }) => {
  const [activeTab, setActiveTab] = useState<'options' | 'subcommands' | 'execute'>('options');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...command, name: e.target.value });
  };

  const handleExecuteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdate({ ...command, execute: e.target.value });
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

  const updateOption = (index: number, updatedOption: any) => {
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
      execute: ''
    });
    onUpdate({ ...command, subcommands });
  };

  const updateSubcommand = (index: number, updatedSubcommand: any) => {
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

  // UI style variables
  const tabStyle = {
    padding: '8px 16px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    fontWeight: 500,
  };

  const activeTabStyle = {
    ...tabStyle,
    borderBottom: '2px solid #3182ce',
    color: '#3182ce',
  };

  return (
    <div className="command-form">
      <div className="form-header" style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
          Command Name:
        </label>
        <input
          type="text"
          value={command.name}
          onChange={handleNameChange}
          placeholder="e.g. Build"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            fontSize: '16px',
          }}
        />
      </div>

      <div className="tabs" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
          <div
            onClick={() => setActiveTab('options')}
            style={activeTab === 'options' ? activeTabStyle : tabStyle}
          >
            Options
          </div>
          <div
            onClick={() => setActiveTab('subcommands')}
            style={activeTab === 'subcommands' ? activeTabStyle : tabStyle}
          >
            Subcommands
          </div>
          <div
            onClick={() => setActiveTab('execute')}
            style={activeTab === 'execute' ? activeTabStyle : tabStyle}
          >
            Execute
          </div>
        </div>
      </div>

      {activeTab === 'options' && (
        <div className="options-tab">
          {command.options?.map((option, index) => (
            <div
              key={`option-${index}`}
              style={{
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                marginBottom: '12px',
              }}
            >
              <OptionForm
                option={option}
                onUpdate={(updatedOption) => updateOption(index, updatedOption)}
                onRemove={() => removeOption(index)}
              />
            </div>
          ))}

          <button
            onClick={addOption}
            style={{
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '8px',
            }}
          >
            Add Option
          </button>
        </div>
      )}

      {activeTab === 'subcommands' && (
        <div className="subcommands-tab">
          {command.subcommands?.map((subcommand, index) => (
            <div
              key={`subcommand-${index}`}
              style={{
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                marginBottom: '12px',
              }}
            >
              <SubCommandForm
                subcommand={subcommand}
                onUpdate={(updatedSubcommand) => updateSubcommand(index, updatedSubcommand)}
                onRemove={() => removeSubcommand(index)}
              />
            </div>
          ))}

          <button
            onClick={addSubcommand}
            style={{
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '8px',
            }}
          >
            Add Subcommand
          </button>
        </div>
      )}

      {activeTab === 'execute' && (
        <div className="execute-tab">
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
            Execute Command:
          </label>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              value={typeof command.execute === 'string' ? command.execute : ''}
              onChange={handleExecuteChange}
              placeholder="npm run build -- --env={{buildType}}"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
              }}
              disabled={command.subcommands && command.subcommands.length > 0}
            />
            {command.subcommands && command.subcommands.length > 0 && (
              <div style={{ marginTop: '4px', fontSize: '14px', color: '#718096' }}>
                Execute is disabled when subcommands exist
              </div>
            )}
          </div>

          <div className="help-text" style={{ marginTop: '8px', fontSize: '14px', color: '#4a5568' }}>
            Use Handlebars syntax for variables: <code>{'{{variable}}'}</code> and conditions: <code>{'{{#if condition}}...{{/if}}'}</code>
          </div>
        </div>
      )}

      <div style={{ marginTop: '16px' }}>
        <button
          onClick={onRemove}
          style={{
            backgroundColor: '#e53e3e',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Remove Command
        </button>
      </div>
    </div>
  );
};

export default CommandForm;
// SubCommandForm.tsx
'use client';

import React, { useState } from 'react';
import { SubCommand } from '../types/commands';
import OptionForm from './OptionForm';

interface SubCommandFormProps {
  subcommand: SubCommand;
  onUpdate: (subcommand: SubCommand) => void;
  onRemove: () => void;
}

const SubCommandForm: React.FC<SubCommandFormProps> = ({ subcommand, onUpdate, onRemove }) => {
  const [activeTab, setActiveTab] = useState<'options' | 'execute' | 'nestedSubcommands'>('options');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...subcommand, name: e.target.value });
  };

  const handleExecuteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdate({ ...subcommand, execute: e.target.value });
  };

  const handleJsonExecuteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsed = JSON.parse(e.target.value);
      onUpdate({ ...subcommand, execute: parsed });
    } catch (error) {
      // Ignore invalid JSON for now - user might still be typing
    }
  };

  const addOption = () => {
    const options = subcommand.options ? [...subcommand.options] : [];
    options.push({
      type: 'input',
      name: '',
      message: ''
    });
    onUpdate({ ...subcommand, options });
  };

  const updateOption = (index: number, updatedOption: any) => {
    if (!subcommand.options) return;
    const options = [...subcommand.options];
    options[index] = updatedOption;
    onUpdate({ ...subcommand, options });
  };

  const removeOption = (index: number) => {
    if (!subcommand.options) return;
    const options = [...subcommand.options];
    options.splice(index, 1);
    onUpdate({ ...subcommand, options });
  };

  const addNestedSubcommand = () => {
    const nestedSubcommands = subcommand.subcommands ? [...subcommand.subcommands] : [];
    nestedSubcommands.push({
      name: 'New Subcommand',
      execute: ''
    });
    onUpdate({ ...subcommand, subcommands: nestedSubcommands });
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

  const convertToJsonExecute = () => {
    if (typeof subcommand.execute === 'string') {
      onUpdate({
        ...subcommand,
        execute: { 'default': subcommand.execute }
      });
    }
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

  const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '14px',
    marginBottom: '8px',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '4px',
    fontWeight: 500,
    fontSize: '14px',
  };

  return (
    <div className="subcommand-form">
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Subcommand Name</label>
        <input
          type="text"
          value={subcommand.name}
          onChange={handleNameChange}
          placeholder="e.g. Docker"
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '16px' }}>
        <div
          onClick={() => setActiveTab('options')}
          style={activeTab === 'options' ? activeTabStyle : tabStyle}
        >
          Options
        </div>
        <div
          onClick={() => setActiveTab('execute')}
          style={activeTab === 'execute' ? activeTabStyle : tabStyle}
        >
          Execute
        </div>
        <div
          onClick={() => setActiveTab('nestedSubcommands')}
          style={activeTab === 'nestedSubcommands' ? activeTabStyle : tabStyle}
        >
          Nested Subcommands
        </div>
      </div>

      {activeTab === 'options' && (
        <div className="options-section">
          {subcommand.options?.map((option, index) => (
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
              background: '#3182ce',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '8px',
            }}
          >
            Add Option
          </button>
        </div>
      )}

      {activeTab === 'execute' && (
        <div className="execute-section">
          {typeof subcommand.execute === 'string' ? (
            <>
              <label style={labelStyle}>Execute Command</label>
              <input
                type="text"
                value={subcommand.execute}
                onChange={handleExecuteChange}
                placeholder="npm run build -- --env={{buildType}}"
                style={inputStyle}
                disabled={subcommand.subcommands && subcommand.subcommands.length > 0}
              />

              <button
                onClick={convertToJsonExecute}
                style={{
                  background: '#4299e1',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: '8px',
                }}
              >
                Convert to Dynamic Execute
              </button>

              {subcommand.subcommands && subcommand.subcommands.length > 0 && (
                <div style={{ marginTop: '8px', color: '#718096', fontSize: '14px' }}>
                  Execute is disabled when nested subcommands exist
                </div>
              )}
            </>
          ) : (
            <>
              <label style={labelStyle}>Dynamic Execute (JSON)</label>
              <textarea
                value={JSON.stringify(subcommand.execute || {}, null, 2)}
                onChange={handleJsonExecuteChange}
                placeholder='{"Install new": "npm install {{packageName}}"}'
                style={{
                  ...inputStyle,
                  fontFamily: 'monospace',
                  minHeight: '120px',
                }}
                disabled={subcommand.subcommands && subcommand.subcommands.length > 0}
              />

              {subcommand.subcommands && subcommand.subcommands.length > 0 && (
                <div style={{ marginTop: '8px', color: '#718096', fontSize: '14px' }}>
                  Execute is disabled when nested subcommands exist
                </div>
              )}
            </>
          )}

          <div style={{ marginTop: '8px', color: '#4a5568', fontSize: '14px' }}>
            Use Handlebars syntax for variables: <code>{'{{variable}}'}</code> and conditions: <code>{'{{#if condition}}...{{/if}}'}</code>
          </div>
        </div>
      )}

      {activeTab === 'nestedSubcommands' && (
        <div className="nested-subcommands-section">
          {subcommand.subcommands?.map((nestedSubcommand, index) => (
            <div
              key={`nested-${index}`}
              style={{
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                marginBottom: '12px',
              }}
            >
              <SubCommandForm
                subcommand={nestedSubcommand}
                onUpdate={(updatedSubcommand) => updateNestedSubcommand(index, updatedSubcommand)}
                onRemove={() => removeNestedSubcommand(index)}
              />
            </div>
          ))}

          <button
            onClick={addNestedSubcommand}
            style={{
              background: '#3182ce',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '8px',
            }}
          >
            Add Nested Subcommand
          </button>
        </div>
      )}

      <div style={{ marginTop: '16px' }}>
        <button
          onClick={onRemove}
          style={{
            background: '#e53e3e',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Remove Subcommand
        </button>
      </div>
    </div>
  );
};

export default SubCommandForm;
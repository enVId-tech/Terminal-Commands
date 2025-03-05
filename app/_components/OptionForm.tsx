'use client';

import React from 'react';
import { CommandOption } from '../types/commands';

interface OptionFormProps {
  option: CommandOption;
  optionId?: string; // Add this prop
  onUpdate: (option: CommandOption) => void;
  onRemove: () => void;
  highlightedElement?: string | null; // This prop might also be needed based on SubCommandForm usage
}

const OptionForm: React.FC<OptionFormProps> = ({ option, onUpdate, onRemove }) => {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ ...option, type: e.target.value as unknown as CommandOption['type'] });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...option, name: e.target.value });
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...option, message: e.target.value });
  };

  const handleDefaultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (option.type === 'confirm') {
      onUpdate({ ...option, default: e.target.checked });
    } else {
      onUpdate({ ...option, default: e.target.value });
    }
  };

  const handleValidateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...option, validate: e.target.value });
  };

  const addChoice = () => {
    const choices = Array.isArray(option.choices) ? [...option.choices, ''] : [''];
    onUpdate({ ...option, choices });
  };

  const updateChoice = (index: number, value: string) => {
    if (!option.choices) return;
    const updatedChoices = [...option.choices];
    updatedChoices[index] = value;
    onUpdate({ ...option, choices: updatedChoices });
  };

  const removeChoice = (index: number) => {
    if (!option.choices) return;
    const updatedChoices = [...option.choices];
    updatedChoices.splice(index, 1);
    onUpdate({ ...option, choices: updatedChoices });
  };

  // Common input styles
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
    <div className="option-form">
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Option Type</label>
          <select
            value={option.type}
            onChange={handleTypeChange}
            style={{ ...inputStyle }}
          >
            <option value="input">Input (Text)</option>
            <option value="list">List (Select)</option>
            <option value="confirm">Confirm (Yes/No)</option>
            <option value="password">Password</option>
            <option value="editor">Editor</option>
            <option value="checkbox">Checkbox</option>
            <option value="number">Number</option>
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Name</label>
          <input
            type="text"
            value={option.name}
            onChange={handleNameChange}
            placeholder="e.g. fileName"
            style={inputStyle}
          />
          <div style={{ fontSize: '12px', color: '#718096' }}>
            Variable name used in templates
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>Message</label>
        <input
          type="text"
          value={option.message}
          onChange={handleMessageChange}
          placeholder="Enter prompt message for the user"
          style={inputStyle}
        />
      </div>

      {option.type !== 'list' && option.type !== 'checkbox' && (
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Default Value</label>
          {option.type === 'confirm' ? (
            <div>
              <input
                type="checkbox"
                checked={Boolean(option.default)}
                onChange={handleDefaultChange}
                style={{ marginRight: '8px' }}
              />
              <span>Default: {Boolean(option.default) ? 'Yes' : 'No'}</span>
            </div>
          ) : (
            <input
              type="text"
              value={option.default?.toString() || ''}
              onChange={handleDefaultChange}
              placeholder="Default value"
              style={inputStyle}
            />
          )}
        </div>
      )}

      {(option.type === 'list' || option.type === 'checkbox') && (
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Choices</label>
          {option.choices?.map((choice, index) => (
            <div key={`choice-${index}`} style={{ display: 'flex', marginBottom: '8px' }}>
              <input
                type="text"
                value={choice}
                onChange={(e) => updateChoice(index, e.target.value)}
                placeholder={`Choice ${index + 1}`}
                style={{ ...inputStyle, marginBottom: 0 }}
              />
              <button
                onClick={() => removeChoice(index)}
                style={{
                  marginLeft: '8px',
                  background: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  width: '32px',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={addChoice}
            style={{
              background: '#3182ce',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Add Choice
          </button>
        </div>
      )}

      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>Validator</label>
        <textarea
          value={option.validate || ''}
          onChange={handleValidateChange}
          placeholder="input => input.trim() !== '' || 'Value is required'"
          style={{
            ...inputStyle,
            fontFamily: 'monospace',
            minHeight: '60px',
          }}
        />
        <div style={{ fontSize: '12px', color: '#718096' }}>
          JavaScript function to validate input
        </div>
      </div>

      <div>
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
          Remove Option
        </button>
      </div>
    </div>
  );
};

export default OptionForm;
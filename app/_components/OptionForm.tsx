'use client';

import React, { useId } from 'react';
import type { CommandOption } from '../types/commands';
import styles from '../../styles/optionform.module.scss';

interface OptionFormProps {
  option: CommandOption;
  optionId?: string;
  onUpdate: (option: CommandOption) => void;
  onRemove: () => void;
  highlightedElement?: string | null;
}

const OPTION_TYPES: { value: CommandOption['type']; label: string }[] = [
  { value: 'input', label: 'Input (text)' },
  { value: 'list', label: 'List (pick one)' },
  { value: 'checkbox', label: 'Checkbox (pick several)' },
  { value: 'confirm', label: 'Confirm (yes / no)' },
  { value: 'number', label: 'Number' },
  { value: 'password', label: 'Password' },
  { value: 'editor', label: 'Editor' },
];

const OptionForm: React.FC<OptionFormProps> = ({ option, onUpdate, onRemove }) => {
  const id = useId();
  const hasChoices = option.type === 'list' || option.type === 'checkbox';
  const set = (patch: Partial<CommandOption>) => onUpdate({ ...option, ...patch });
  const choices = option.choices ?? [];

  return (
    <div className={styles.optionForm}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${id}-type`}>Type</label>
          <select
            id={`${id}-type`}
            className={styles.select}
            value={option.type}
            onChange={(e) => set({ type: e.target.value as CommandOption['type'] })}
          >
            {OPTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${id}-name`}>Variable name</label>
          <input
            id={`${id}-name`}
            className={styles.input}
            value={option.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="fileName"
          />
          <span className={styles.hint}>Use it in commands as {`{{${option.name || 'name'}}}`}</span>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-message`}>Prompt</label>
        <input
          id={`${id}-message`}
          className={styles.input}
          value={option.message}
          onChange={(e) => set({ message: e.target.value })}
          placeholder="What should the user be asked?"
        />
      </div>

      {hasChoices ? (
        <div className={styles.field}>
          <span className={styles.label}>Choices</span>
          {choices.map((choice, index) => (
            <div key={index} className={styles.choice}>
              <input
                className={styles.input}
                value={choice}
                aria-label={`Choice ${index + 1}`}
                onChange={(e) => set({ choices: choices.map((c, i) => (i === index ? e.target.value : c)) })}
                placeholder={`Choice ${index + 1}`}
              />
              <button
                type="button"
                className={styles.iconButton}
                aria-label={`Remove choice ${index + 1}`}
                onClick={() => set({ choices: choices.filter((_, i) => i !== index) })}
              >
                ×
              </button>
            </div>
          ))}
          <button type="button" className={styles.button} onClick={() => set({ choices: [...choices, ''] })}>
            Add choice
          </button>
        </div>
      ) : (
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${id}-default`}>Default value</label>
          {option.type === 'confirm' ? (
            <label className={styles.checkRow}>
              <input
                id={`${id}-default`}
                type="checkbox"
                checked={Boolean(option.default)}
                onChange={(e) => set({ default: e.target.checked })}
              />
              Yes by default
            </label>
          ) : (
            <input
              id={`${id}-default`}
              className={styles.input}
              type={option.type === 'number' ? 'number' : 'text'}
              value={option.default?.toString() ?? ''}
              onChange={(e) => set({ default: option.type === 'number' && e.target.value !== '' ? Number(e.target.value) : e.target.value })}
              placeholder="Optional"
            />
          )}
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-validate`}>Validator (optional)</label>
        <textarea
          id={`${id}-validate`}
          className={styles.textarea}
          value={option.validate ?? ''}
          onChange={(e) => set({ validate: e.target.value || undefined })}
          placeholder="input => input.trim() !== '' || 'A value is required'"
          spellCheck={false}
        />
        <span className={styles.hint}>A JavaScript function. Return true, or a message to reject the input.</span>
      </div>

      <button type="button" className={styles.dangerButton} onClick={onRemove}>Remove option</button>
    </div>
  );
};

export default OptionForm;

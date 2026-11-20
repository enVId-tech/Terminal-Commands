'use client';

import { useMemo, useState } from 'react';
import type { CommandConfig } from '../types/commands';
import { parseConfig, serializeConfig, type ConfigFormat } from '../lib/config-io';
import styles from '../../styles/raw-editor.module.scss';

interface RawEditorProps {
  config: CommandConfig;
  format: ConfigFormat;
  onApply: (config: CommandConfig) => void;
}

/** Edit the config as text. The text is only applied once it parses. */
export default function RawEditor({ config, format, onApply }: RawEditorProps) {
  const [text, setText] = useState(() => serializeConfig(config, format));

  const { parsed, error } = useMemo(() => {
    try {
      return { parsed: parseConfig(text, format), error: null };
    } catch (e) {
      return { parsed: null, error: e instanceof Error ? e.message : String(e) };
    }
  }, [text, format]);

  const dirty = text !== serializeConfig(config, format);

  return (
    <div className={styles.editor}>
      <textarea
        className={`${styles.textarea} ${error ? styles.invalid : ''}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        aria-label={`Raw ${format.toUpperCase()} configuration`}
        aria-invalid={!!error}
      />
      <div className={styles.bar}>
        <span className={error ? styles.error : styles.ok} role="status">
          {error ? error : dirty ? 'Valid. Not applied yet.' : 'Matches the visual editor.'}
        </span>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} disabled={!dirty} onClick={() => setText(serializeConfig(config, format))}>
            Discard
          </button>
          <button type="button" className={styles.primary} disabled={!parsed || !dirty} onClick={() => parsed && onApply(parsed)}>
            Apply changes
          </button>
        </div>
      </div>
    </div>
  );
}

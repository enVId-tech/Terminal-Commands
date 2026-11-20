'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { CommandConfig } from '../types/commands';
import { exampleConfig } from './example';

const KEY = 'terminal-commands:draft';
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

const read = (): string | null => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

/**
 * The config being edited, kept in localStorage so a reload does not lose work.
 * Without a saved draft it starts from the example, which also keeps server and
 * first client render identical.
 */
export function useDraft(): [CommandConfig, (config: CommandConfig) => void] {
  const stored = useSyncExternalStore(subscribe, read, () => null);

  const config = useMemo<CommandConfig>(() => {
    if (!stored) return exampleConfig;
    try {
      const parsed = JSON.parse(stored) as CommandConfig;
      return Array.isArray(parsed.commands) ? parsed : exampleConfig;
    } catch {
      return exampleConfig;
    }
  }, [stored]);

  const setConfig = useCallback((next: CommandConfig) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Storage can be unavailable (private mode, quota); editing still works for this session.
    }
    listeners.forEach((listener) => listener());
  }, []);

  return [config, setConfig];
}

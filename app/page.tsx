'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import NodeForm from './_components/NodeForm';
import Outline from './_components/Outline';
import RawEditor from './_components/RawEditor';
import { configFilename, formatFromFilename, parseConfig, serializeConfig, type ConfigFormat } from './lib/config-io';
import { exampleConfig } from './lib/example';
import { useDraft } from './lib/use-draft';
import type { Command, CommandConfig } from './types/commands';
import styles from '../styles/home.module.scss';

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

type Notice = { kind: 'success' | 'error'; text: string };
type View = 'visual' | 'raw';

/** Where the selected index ends up after dragging an item from one position to another. */
function indexAfterMove(selected: number, from: number, to: number): number {
  if (selected === from) return to;
  if (from < selected && selected <= to) return selected - 1;
  if (to <= selected && selected < from) return selected + 1;
  return selected;
}

export default function Home() {
  const [config, setConfig] = useDraft();
  const [selected, setSelected] = useState<number | null>(0);
  const [view, setView] = useState<View>('visual');
  const [format, setFormat] = useState<ConfigFormat>('yaml');
  const [showOutline, setShowOutline] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [fileDrag, setFileDrag] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const commands = config.commands;
  const current = selected !== null ? commands[selected] : undefined;

  const say = useCallback((kind: Notice['kind'], text: string) => setNotice({ kind, text }), []);

  // Messages disappear on their own.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), notice.kind === 'error' ? 6000 : 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  // After the outline asks for an element, scroll to it and fade the highlight.
  useEffect(() => {
    if (!highlighted) return;
    document.querySelector(`[data-id="${CSS.escape(highlighted)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const timer = setTimeout(() => setHighlighted(null), 2500);
    return () => clearTimeout(timer);
  }, [highlighted]);

  const replaceCommands = (next: Command[]) => setConfig({ ...config, commands: next });

  const navigateTo = (commandIndex: number, path: string[]) => {
    setView('visual');
    setSelected(commandIndex);
    const base = `cmd-${commandIndex}`;
    setHighlighted(path.length ? `${base}-${path.join('-')}` : base);
  };

  const addCommand = () => {
    replaceCommands([...commands, { name: 'New command', executeCommands: [''] }]);
    setSelected(commands.length);
  };

  const removeCommand = (index: number) => {
    replaceCommands(commands.filter((_, i) => i !== index));
    setSelected(null);
  };

  const importFile = async (file: File) => {
    const detected = formatFromFilename(file.name);
    if (!detected) return say('error', 'Only .json, .yaml and .yml files can be imported.');
    if (file.size > MAX_IMPORT_BYTES) return say('error', 'Configuration files must be 5 MB or smaller.');
    try {
      setConfig(parseConfig(await file.text(), detected));
      setFormat(detected);
      setSelected(0);
      say('success', `Imported ${file.name}`);
    } catch (error) {
      say('error', `Could not import ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const exportFile = () => {
    const blob = new Blob([serializeConfig(config, format)], { type: format === 'json' ? 'application/json' : 'application/yaml' });
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'), { href: url, download: configFilename(format) });
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadExample = () => {
    setConfig(exampleConfig);
    setSelected(0);
    say('success', 'Example loaded');
  };

  const clearAll = () => {
    if (commands.length > 0 && !window.confirm('Remove every command from the editor?')) return;
    setConfig({ commands: [] } satisfies CommandConfig);
    setSelected(null);
  };

  const onSidebarDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const { index: from } = result.source;
    const { index: to } = result.destination;
    const next = [...commands];
    next.splice(to, 0, ...next.splice(from, 1));
    replaceCommands(next);
    if (selected !== null) setSelected(indexAfterMove(selected, from, to));
  };

  // Dropping a file anywhere on the page imports it. Only react to real files so in-page dragging is unaffected.
  const hasFiles = (e: React.DragEvent) => e.dataTransfer.types.includes('Files');
  const onDragEnter = (e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    dragDepth.current++;
    setFileDrag(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setFileDrag(false);
  };
  const onDrop = (e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dragDepth.current = 0;
    setFileDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) void importFile(file);
  };

  return (
    <div className={styles.page} onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDragOver={(e) => hasFiles(e) && e.preventDefault()} onDrop={onDrop}>
      {fileDrag && (
        <div className={styles.dropOverlay} aria-hidden="true">
          <div className={styles.dropCard}>Drop a .json, .yaml or .yml file to import it</div>
        </div>
      )}

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Terminal Commands</h1>
          <p className={styles.subtitle}>Design a command workflow here, then run it in your terminal.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/documentation" className={styles.secondary}>Documentation</Link>
          <button type="button" className={styles.primary} onClick={exportFile}>
            Export {configFilename(format)}
          </button>
        </div>
      </header>

      <div className={styles.live} aria-live="polite">
        {notice && (
          <div className={`${styles.notice} ${notice.kind === 'error' ? styles.error : styles.success}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
            {notice.text}
            <button type="button" className={styles.dismiss} aria-label="Dismiss" onClick={() => setNotice(null)}>×</button>
          </div>
        )}
      </div>

      <div className={styles.toolbar}>
        <button type="button" className={styles.secondary} onClick={() => fileInput.current?.click()}>Import</button>
        <input ref={fileInput} type="file" accept=".json,.yml,.yaml" hidden onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void importFile(file);
          e.target.value = '';
        }} />
        <button type="button" className={styles.secondary} onClick={loadExample}>Load example</button>
        <button type="button" className={styles.secondary} onClick={clearAll}>Clear</button>
        <div className={styles.spacer} />
        <div className={styles.segmented} role="group" aria-label="File format">
          {(['yaml', 'json'] as const).map((f) => (
            <button key={f} type="button" aria-pressed={format === f} className={format === f ? styles.on : ''} onClick={() => setFormat(f)}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <div className={styles.segmented} role="group" aria-label="Editor view">
          <button type="button" aria-pressed={view === 'visual'} className={view === 'visual' ? styles.on : ''} onClick={() => setView('visual')}>Visual</button>
          <button type="button" aria-pressed={view === 'raw'} className={view === 'raw' ? styles.on : ''} onClick={() => setView('raw')}>Raw</button>
        </div>
      </div>

      {view === 'raw' ? (
        // Re-created when the format changes so the text is regenerated in the new format.
        <RawEditor key={format} config={config} format={format} onApply={(next) => { setConfig(next); say('success', 'Changes applied'); }} />
      ) : (
        <div className={styles.workspace}>
          <aside className={styles.sidebar} aria-label="Commands">
            <div className={styles.sidebarHead}>
              <h2>Commands</h2>
              <button type="button" className={styles.link} aria-pressed={showOutline} onClick={() => setShowOutline((v) => !v)}>
                {showOutline ? 'List' : 'Outline'}
              </button>
            </div>

            {showOutline ? (
              <Outline commands={commands} onNavigate={navigateTo} />
            ) : (
              <DragDropContext onDragEnd={onSidebarDragEnd}>
                <Droppable droppableId="commands" type="commands">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className={styles.commandList}>
                      {commands.map((command, index) => (
                        <Draggable key={index} draggableId={`command-${index}`} index={index}>
                          {(drag, snapshot) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              className={`${styles.commandItem} ${selected === index ? styles.selected : ''} ${snapshot.isDragging ? styles.dragging : ''}`}
                              role="button"
                              tabIndex={0}
                              aria-current={selected === index}
                              onClick={() => setSelected(index)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target === e.currentTarget) setSelected(index);
                              }}
                            >
                              <span className={styles.commandName}>{command.name || 'Untitled'}</span>
                              {command.description && <span className={styles.commandDescription}>{command.description}</span>}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            <button type="button" className={styles.add} onClick={addCommand}>+ Add command</button>
          </aside>

          <section className={styles.editor} aria-label="Command editor">
            {current && selected !== null ? (
              <NodeForm
                key={selected}
                node={current}
                nodeId={`cmd-${selected}`}
                onUpdate={(updated) => replaceCommands(commands.map((c, i) => (i === selected ? updated : c)))}
                onRemove={() => removeCommand(selected)}
                highlightedElement={highlighted}
              />
            ) : (
              <div className={styles.blank}>
                <p>{commands.length === 0 ? 'No commands yet.' : 'Pick a command on the left to edit it.'}</p>
                {commands.length === 0 && <button type="button" className={styles.primary} onClick={addCommand}>Create your first command</button>}
              </div>
            )}
          </section>
        </div>
      )}

      <footer className={styles.footer}>
        <p>
          Your work is saved in this browser. Run it with <code>npx terminal-commands {configFilename(format)}</code>
          {' · '}
          <a href="https://github.com/enVId-tech/Terminal-Commands" rel="noopener noreferrer">GitHub</a>
        </p>
      </footer>
    </div>
  );
}

'use client';

import React, { useId, useState } from 'react';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import type { CommandNode, CommandOption } from '../types/commands';
import OptionForm from './OptionForm';
import styles from '../../styles/nodeform.module.scss';

type Tab = 'options' | 'subcommands' | 'execute';

interface NodeFormProps {
  node: CommandNode;
  /** Unique id of this node in the tree. Child ids extend it, which is how the outline finds them. */
  nodeId: string;
  kind?: 'command' | 'subcommand';
  onUpdate: (node: CommandNode) => void;
  onRemove: () => void;
  highlightedElement?: string | null;
}

const LANGUAGES = [
  ['default', 'Shell (default)'],
  ['javascript', 'JavaScript'],
  ['typescript', 'TypeScript'],
  ['cpp', 'C++'],
  ['csharp', 'C#'],
  ['java', 'Java'],
  ['kotlin', 'Kotlin'],
] as const;

function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

const reorder = (result: DropResult) =>
  result.destination && result.destination.index !== result.source.index
    ? { from: result.source.index, to: result.destination.index }
    : null;

function tabForHighlight(nodeId: string, highlighted?: string | null): Tab | null {
  if (!highlighted?.startsWith(`${nodeId}-`)) return null;
  const rest = highlighted.slice(nodeId.length + 1);
  if (rest.startsWith('option-')) return 'options';
  if (rest.startsWith('subcommands-')) return 'subcommands';
  return null;
}

interface ItemProps {
  id: string;
  index: number;
  highlighted?: boolean;
  children: React.ReactNode;
}

/** A draggable row with a handle on the left. */
function Item({ id, index, highlighted, children }: ItemProps) {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          data-id={id}
          className={[styles.item, highlighted && styles.highlighted, snapshot.isDragging && styles.dragging]
            .filter(Boolean)
            .join(' ')}
        >
          <span className={styles.handle} {...provided.dragHandleProps} aria-label="Drag to reorder" title="Drag to reorder">
            ⠿
          </span>
          <div className={styles.itemBody}>{children}</div>
        </div>
      )}
    </Draggable>
  );
}

interface CommandsEditorProps {
  id: string;
  commands: string[];
  onChange: (commands: string[]) => void;
  addLabel: string;
  placeholder: string;
}

/** Sortable list of command templates. */
function CommandsEditor({ id, commands, onChange, addLabel, placeholder }: CommandsEditorProps) {
  return (
    <div className={styles.stack}>
      <DragDropContext
        onDragEnd={(result) => {
          const change = reorder(result);
          if (change) onChange(move(commands, change.from, change.to));
        }}
      >
        <Droppable droppableId={id} type={id}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className={styles.stack}>
              {commands.map((command, index) => (
                <Item key={index} id={`${id}-${index}`} index={index}>
                  <div className={styles.commandRow}>
                    <textarea
                      className={styles.code}
                      value={command}
                      aria-label={`Command ${index + 1}`}
                      placeholder={placeholder}
                      spellCheck={false}
                      rows={Math.max(2, command.split('\n').length)}
                      onChange={(e) => onChange(commands.map((c, i) => (i === index ? e.target.value : c)))}
                    />
                    <button
                      type="button"
                      className={styles.iconButton}
                      aria-label={`Remove command ${index + 1}`}
                      onClick={() => onChange(commands.filter((_, i) => i !== index))}
                    >
                      ×
                    </button>
                  </div>
                </Item>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <button type="button" className={styles.button} onClick={() => onChange([...commands, ''])}>
        {addLabel}
      </button>
    </div>
  );
}

/**
 * Editor for one command or subcommand. Subcommands render another NodeForm,
 * so the same component edits a tree of any depth.
 */
export default function NodeForm({ node, nodeId, kind = 'command', onUpdate, onRemove, highlightedElement }: NodeFormProps) {
  const uid = useId();
  const [tab, setTab] = useState<Tab>('options');

  // Jump to the tab that holds the element the outline asked for (adjusting state while rendering).
  const [seenHighlight, setSeenHighlight] = useState<string | null | undefined>(null);
  if (highlightedElement !== seenHighlight) {
    setSeenHighlight(highlightedElement);
    const wanted = tabForHighlight(nodeId, highlightedElement);
    if (wanted && wanted !== tab) setTab(wanted);
  }

  const set = (patch: Partial<CommandNode>) => onUpdate({ ...node, ...patch });
  const options = node.options ?? [];
  const subcommands = node.subcommands ?? [];
  const commands = node.executeCommands ?? (typeof node.execute === 'string' ? [node.execute] : []);
  const hasLegacyMap = !!node.execute && typeof node.execute === 'object';
  const isHighlighted = (id: string) => highlightedElement === id;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'options', label: 'Prompts', count: options.length },
    { id: 'subcommands', label: kind === 'command' ? 'Subcommands' : 'Nested subcommands', count: subcommands.length },
    { id: 'execute', label: 'Run', count: commands.length },
  ];

  const newOption = (): CommandOption => ({ type: 'input', name: '', message: '' });

  return (
    <div className={styles.form}>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${uid}-name`}>
            {kind === 'command' ? 'Command' : 'Subcommand'} name
          </label>
          <input
            id={`${uid}-name`}
            className={styles.input}
            value={node.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Build"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${uid}-description`}>Description (optional)</label>
          <input
            id={`${uid}-description`}
            className={styles.input}
            value={node.description ?? ''}
            onChange={(e) => set({ description: e.target.value || undefined })}
            placeholder="Shown in the outline"
          />
        </div>
      </div>

      <div className={styles.tabs} role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`${uid}-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`${uid}-panel`}
            className={`${styles.tab} ${tab === t.id ? styles.active : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.count ? <span className={styles.badge}>{t.count}</span> : null}
          </button>
        ))}
      </div>

      <div className={styles.panel} role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${tab}`}>
        {tab === 'options' && (
          <div className={styles.stack}>
            {options.length === 0 && <p className={styles.empty}>No prompts. Add one to ask the user for a value.</p>}
            <DragDropContext
              onDragEnd={(result) => {
                const change = reorder(result);
                if (change) set({ options: move(options, change.from, change.to) });
              }}
            >
              <Droppable droppableId={`${nodeId}-options`} type={`${nodeId}-options`}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className={styles.stack}>
                    {options.map((option, index) => {
                      const id = `${nodeId}-option-${index}`;
                      return (
                        <Item key={index} id={id} index={index} highlighted={isHighlighted(id)}>
                          <OptionForm
                            option={option ?? newOption()}
                            optionId={id}
                            onUpdate={(updated) => set({ options: options.map((o, i) => (i === index ? updated : o)) })}
                            onRemove={() => set({ options: options.filter((_, i) => i !== index) })}
                          />
                        </Item>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <button type="button" className={styles.button} onClick={() => set({ options: [...options, newOption()] })}>
              Add prompt
            </button>
          </div>
        )}

        {tab === 'subcommands' && (
          <div className={styles.stack}>
            {subcommands.length === 0 && <p className={styles.empty}>No subcommands. Add some to turn this into a menu.</p>}
            <DragDropContext
              onDragEnd={(result) => {
                const change = reorder(result);
                if (change) set({ subcommands: move(subcommands, change.from, change.to) });
              }}
            >
              <Droppable droppableId={`${nodeId}-subcommands`} type={`${nodeId}-subcommands`}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className={styles.stack}>
                    {subcommands.map((sub, index) => {
                      const id = `${nodeId}-subcommands-subcommand-${index}`;
                      return (
                        <Item key={index} id={id} index={index} highlighted={isHighlighted(id)}>
                          <NodeForm
                            node={sub}
                            nodeId={id}
                            kind="subcommand"
                            highlightedElement={highlightedElement}
                            onUpdate={(updated) => set({ subcommands: subcommands.map((s, i) => (i === index ? updated : s)) })}
                            onRemove={() => set({ subcommands: subcommands.filter((_, i) => i !== index) })}
                          />
                        </Item>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <button
              type="button"
              className={styles.button}
              onClick={() => set({ subcommands: [...subcommands, { name: 'New subcommand', executeCommands: [''] }] })}
            >
              Add subcommand
            </button>
          </div>
        )}

        {tab === 'execute' && (
          <div className={styles.stack}>
            <div className={styles.checks}>
              <label className={styles.check}>
                <input type="checkbox" checked={!!node.executeParallel} onChange={(e) => set({ executeParallel: e.target.checked })} />
                Run the commands in parallel
              </label>
              <label className={styles.check}>
                <input type="checkbox" checked={!!node.requireExecutionChoice} onChange={(e) => set({ requireExecutionChoice: e.target.checked })} />
                Ask whether to run in parallel each time
              </label>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={`${uid}-language`}>Commands are written in</label>
              <select
                id={`${uid}-language`}
                className={styles.input}
                value={node.language ?? 'default'}
                onChange={(e) => set({ language: e.target.value === 'default' ? undefined : e.target.value })}
              >
                {LANGUAGES.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {hasLegacyMap && (
              <p className={styles.notice}>
                This {kind} uses the older <code>execute</code> map. It is kept as is, and the commands below take priority when present.
              </p>
            )}

            <span className={styles.label}>Commands</span>
            <CommandsEditor
              id={`${nodeId}-run`}
              commands={commands}
              addLabel="Add command"
              placeholder="npm run build -- --env={{buildType}}"
              onChange={(next) => set({ executeCommands: next, execute: hasLegacyMap ? node.execute : undefined })}
            />

            <span className={styles.label}>After everything else</span>
            <CommandsEditor
              id={`${nodeId}-post`}
              commands={node.postExecuteCommands ?? []}
              addLabel="Add follow-up command"
              placeholder="echo Done"
              onChange={(next) => set({ postExecuteCommands: next.length ? next : undefined })}
            />

            <p className={styles.help}>
              Commands are Handlebars templates: <code>{'{{variable}}'}</code>, <code>{"{{#if (eq env 'prod')}}…{{/if}}"}</code>,{' '}
              <code>{'{{quote name}}'}</code> for shell-safe values.
            </p>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.dangerButton} onClick={onRemove}>
          Remove {kind}
        </button>
      </div>
    </div>
  );
}

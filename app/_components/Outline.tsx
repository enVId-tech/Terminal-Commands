import type { CommandNode } from '../types/commands';
import styles from '../../styles/outline.module.scss';

interface OutlineProps {
  commands: CommandNode[];
  /** Called with the command index and the path of the element inside it. */
  onNavigate: (commandIndex: number, path: string[]) => void;
}

function Branch({ node, path, index, onNavigate }: { node: CommandNode; path: string[]; index: number; onNavigate: OutlineProps['onNavigate'] }) {
  return (
    <ul className={styles.list}>
      {(node.options ?? []).map((option, i) => (
        <li key={`o${i}`}>
          <button type="button" className={styles.option} onClick={() => onNavigate(index, [...path, `option-${i}`])}>
            {option?.name || 'unnamed'} <span className={styles.type}>{option?.type}</span>
          </button>
        </li>
      ))}
      {(node.subcommands ?? []).map((sub, i) => {
        const subPath = [...path, 'subcommands', `subcommand-${i}`];
        return (
          <li key={`s${i}`}>
            <button type="button" className={styles.node} onClick={() => onNavigate(index, subPath)}>
              {sub.name || 'Untitled'}
            </button>
            <Branch node={sub} path={subPath} index={index} onNavigate={onNavigate} />
          </li>
        );
      })}
    </ul>
  );
}

/** Read-only map of the whole config. Click an entry to jump to it in the editor. */
export default function Outline({ commands, onNavigate }: OutlineProps) {
  if (commands.length === 0) return <p className={styles.empty}>Nothing to show yet.</p>;
  return (
    <nav aria-label="Command outline">
      <ul className={styles.list}>
        {commands.map((command, index) => (
          <li key={index}>
            <button type="button" className={styles.node} onClick={() => onNavigate(index, [])}>
              {command.name || 'Untitled'}
            </button>
            <Branch node={command} path={[]} index={index} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

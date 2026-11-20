import { spawn } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

export interface RunContext {
  /** Print what would run without running it. */
  dryRun: boolean;
}

let activeChildren = 0;

/** True while a child process owns the terminal and handles Ctrl+C itself. */
export const hasActiveChild = (): boolean => activeChildren > 0;

/** Run one shell command with the terminal attached. Resolves with its exit code. */
export function runShell(command: string, ctx: RunContext, cwd?: string): Promise<number> {
  console.log(`$ ${command}`);
  if (ctx.dryRun) return Promise.resolve(0);

  return new Promise((resolve) => {
    // `shell: true` uses cmd.exe on Windows and /bin/sh elsewhere.
    const child = spawn(command, { shell: true, stdio: 'inherit', cwd });
    activeChildren++;
    let settled = false;
    const finish = (code: number) => {
      if (settled) return;
      settled = true;
      activeChildren--;
      resolve(code);
    };
    child.on('error', (error) => {
      console.error(`Could not start the command: ${error.message}`);
      finish(1);
    });
    child.on('close', (code, signal) => {
      if (signal === 'SIGINT' || code === 130) console.log('\nCommand interrupted.');
      else if (code !== 0) console.error(`Command exited with code ${code ?? signal}`);
      finish(code ?? 1);
    });
  });
}

/** Run shell commands one after another, or all at once. */
export async function runShellCommands(commands: string[], parallel: boolean, ctx: RunContext): Promise<void> {
  if (parallel) {
    await Promise.all(commands.map((command) => runShell(command, ctx)));
  } else {
    for (const command of commands) await runShell(command, ctx);
  }
}

interface LanguageSpec {
  file: (dir: string, source: string) => string;
  command: (file: string, dir: string) => string;
}

const q = (value: string) => `"${value}"`;
const exe = (file: string) => file.replace(/\.[^./\\]+$/, process.platform === 'win32' ? '.exe' : '');

const LANGUAGES: Record<string, LanguageSpec> = {
  javascript: { file: (d) => path.join(d, 'script.js'), command: (f) => `node ${q(f)}` },
  // Node 22.18+ strips types natively, so TypeScript needs no extra tooling.
  typescript: { file: (d) => path.join(d, 'script.ts'), command: (f) => `node ${q(f)}` },
  cpp: { file: (d) => path.join(d, 'main.cpp'), command: (f) => `g++ ${q(f)} -o ${q(exe(f))} && ${q(exe(f))}` },
  csharp: { file: (d) => path.join(d, 'script.csx'), command: (f) => `dotnet script ${q(f)}` },
  java: {
    // A public class must live in a file with the same name.
    file: (d, source) => path.join(d, `${source.match(/public\s+class\s+(\w+)/)?.[1] ?? 'Main'}.java`),
    command: (f, d) => `javac ${q(f)} -d ${q(d)} && java -cp ${q(d)} ${path.basename(f, '.java')}`,
  },
  kotlin: {
    file: (d) => path.join(d, 'script.kt'),
    command: (f, d) => `kotlinc ${q(f)} -include-runtime -d ${q(path.join(d, 'script.jar'))} && java -jar ${q(path.join(d, 'script.jar'))}`,
  },
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGES);

/** Write `source` to a private temp directory, run it with the language's toolchain, then clean up. */
export async function runSource(source: string, language: string, ctx: RunContext): Promise<void> {
  const spec = LANGUAGES[language];
  if (!spec) {
    console.error(`Unsupported language "${language}". Supported: ${SUPPORTED_LANGUAGES.join(', ')}`);
    return;
  }
  if (ctx.dryRun) {
    console.log(`[${language}]\n${source}`);
    return;
  }
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'terminal-commands-'));
  try {
    const file = spec.file(dir, source);
    await fs.writeFile(file, source);
    await runShell(spec.command(file, dir), ctx);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

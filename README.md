# Terminal Commands

Design interactive command-line workflows in the browser, then run them in your terminal.

You describe a workflow once in a JSON or YAML file: prompts, commands, subcommands, follow-up steps. The CLI turns it into a menu, asks for the inputs, fills them into your command templates and runs everything, one after another or in parallel.

- Visual editor with drag-and-drop ordering, a raw JSON/YAML view and a live outline (light and dark theme)
- Prompts: text, list, checkbox, confirm, number, password, editor, with optional validators
- Handlebars templates in commands: `{{name}}`, `{{#if (eq env 'prod')}}…{{/if}}`, `{{quote value}}`
- Nested subcommands, post-run commands, sequential or parallel execution
- Commands can also be snippets in JavaScript, TypeScript, C++, C#, Java or Kotlin
- `--dry-run` shows what would run without running it

The editor is live at <https://commands.etran.dev>, and your work is saved in the browser.

## Quick start

You need [Node.js](https://nodejs.org/) 22.18 or newer.

1. Open the editor, build your workflow and click **Export**. Save the file as `commands.yaml` in the folder you want to run it from (or in a `data/` folder).
2. Run it:

```bash
npx github:enVId-tech/Terminal-Commands
```

To install it once and use it anywhere:

```bash
npm install -g github:enVId-tech/Terminal-Commands
terminal-commands
```

The CLI looks for `./commands.yaml`, `./commands.yml`, `./commands.json` and everything in `./data`. Point it somewhere else with `--config`:

```bash
terminal-commands path/to/workflow.yaml
terminal-commands --config workflow.json --dry-run
terminal-commands --list
```

| Option | |
| --- | --- |
| `-c, --config <file>` | Configuration to use. Also read from `TERMINAL_COMMANDS_CONFIG`. |
| `-l, --list` | Print the command tree and exit |
| `-n, --dry-run` | Print commands without running them |
| `-h, --help`, `-v, --version` | |

## Example

```yaml
commands:
  - name: Build Project
    options:
      - type: list
        name: buildType
        message: Select build configuration
        choices: [development, production, staging]
      - type: confirm
        name: minify
        message: Minify the output?
        default: false
    executeCommands:
      - npm run build -- --env={{buildType}} {{#if minify}}--minify{{/if}}
      - echo Build completed for {{buildType}}
```

The full format, with every field and more examples, is in the **Documentation** page of the editor.

## Develop

```bash
git clone https://github.com/enVId-tech/Terminal-Commands.git
cd Terminal-Commands
npm install
npm run dev        # editor at http://localhost:3000
npm run cli        # run the CLI straight from source
npm run check      # lint, typecheck and tests
```

| Script | |
| --- | --- |
| `npm run dev` / `build` / `start` | The editor (Next.js) |
| `npm run build:cli` | Compile the CLI to `dist/` (runs on install) |
| `npm test` | Unit tests, using Node's built-in test runner |

## Security note

Configuration files are trusted: commands run in your shell, and validators are evaluated as JavaScript. Only run configurations you wrote or have read. Values typed into prompts are substituted as is, so use `{{quote name}}` when a value must stay a single shell argument.

## License

[MIT](LICENSE)

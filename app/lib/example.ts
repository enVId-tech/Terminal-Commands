import type { CommandConfig } from '../types/commands';

/** The configuration loaded by "Load example" and shown to first-time visitors. */
export const exampleConfig: CommandConfig = {
  commands: [
    {
      name: 'Build Project',
      description: 'Build the project with the chosen configuration',
      options: [
        {
          type: 'list',
          name: 'buildType',
          message: 'Select build configuration',
          choices: ['development', 'production', 'staging'],
          default: 'development',
        },
        { type: 'confirm', name: 'minify', message: 'Minify the output?', default: false },
      ],
      executeCommands: [
        'npm run build -- --env={{buildType}} {{#if minify}}--minify{{/if}}',
        'echo Build completed for {{buildType}} environment',
      ],
      executeParallel: false,
    },
    {
      name: 'Install & Setup',
      description: 'Install dependencies and set up the environment',
      executeCommands: ['npm install', 'npx husky install', 'cp .env.example .env'],
      executeParallel: true,
      requireExecutionChoice: true,
    },
    {
      name: 'Run Tests',
      options: [
        {
          type: 'checkbox',
          name: 'testTypes',
          message: 'Select test types to run',
          choices: ['unit', 'integration', 'e2e'],
        },
      ],
      executeCommands: [
        "{{#if (includes testTypes 'unit')}}npm run test:unit{{/if}}",
        "{{#if (includes testTypes 'integration')}}npm run test:integration{{/if}}",
        "{{#if (includes testTypes 'e2e')}}npm run test:e2e{{/if}}",
      ],
    },
    {
      name: 'Docker Operations',
      subcommands: [
        {
          name: 'Start Containers',
          executeCommands: ['docker compose up -d', 'echo Docker containers started'],
        },
        { name: 'Stop Containers', executeCommands: ['docker compose down'] },
        {
          name: 'Database Setup',
          options: [
            {
              type: 'list',
              name: 'dbOperation',
              message: 'Choose a database operation',
              choices: ['migrate', 'seed', 'reset'],
            },
            { type: 'input', name: 'dbName', message: 'Database name', default: 'myapp' },
          ],
          executeCommands: [
            "{{#if (eq dbOperation 'migrate')}}npx prisma migrate dev{{/if}}",
            "{{#if (eq dbOperation 'seed')}}npx prisma db seed{{/if}}",
            "{{#if (eq dbOperation 'reset')}}npx prisma migrate reset --force{{/if}}",
          ],
          postExecuteCommands: ['echo {{dbOperation}} finished for {{dbName}}'],
        },
      ],
    },
  ],
};

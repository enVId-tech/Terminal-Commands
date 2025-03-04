// app/api/commands/example/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const exampleConfig = {
    commands: [
      {
        name: "Build Project",
        options: [
          {
            type: "list",
            name: "buildType",
            message: "Select build configuration:",
            choices: ["development", "production", "staging"]
          },
          {
            type: "confirm",
            name: "minify",
            message: "Minify the output?",
            default: false
          }
        ],
        executeCommands: [
          "npm run build -- --env={{buildType}} {{#if minify}}--minify{{/if}}",
          "echo Build completed for {{buildType}} environment"
        ],
        executeParallel: false
      },
      {
        name: "Install Dependencies & Setup",
        description: "Install dependencies and setup project in parallel",
        executeCommands: [
          "npm install",
          "npx husky install",
          "cp .env.example .env"
        ],
        executeParallel: true
      },
      {
        name: "Docker Operations",
        subcommands: [
          {
            name: "Start Containers",
            executeCommands: [
              "docker-compose up -d",
              "echo Docker containers started successfully"
            ],
            executeParallel: false
          },
          {
            name: "Stop Containers",
            execute: "docker-compose down"
          },
          {
            name: "Rebuild & Start",
            executeCommands: [
              "docker-compose down",
              "docker-compose build",
              "docker-compose up -d"
            ],
            executeParallel: false
          }
        ]
      },
      {
        name: "Run Tests",
        options: [
          {
            type: "checkbox",
            name: "testTypes",
            message: "Select test types to run:",
            choices: ["unit", "integration", "e2e"]
          }
        ],
        executeCommands: [
          "{{#if testTypes.includes 'unit'}}npm run test:unit{{/if}}",
          "{{#if testTypes.includes 'integration'}}npm run test:integration{{/if}}",
          "{{#if testTypes.includes 'e2e'}}npm run test:e2e{{/if}}"
        ],
        executeParallel: false
      },
      {
        name: "Backend Operations",
        subcommands: [
          {
            name: "Database Operations",
            options: [
              {
                type: "list",
                name: "dbOperation",
                message: "Choose a database operation:",
                choices: ["migrate", "seed", "reset"]
              }
            ],
            executeCommands: [
              "{{#if dbOperation == 'migrate'}}npx prisma migrate dev{{/if}}",
              "{{#if dbOperation == 'seed'}}npx prisma db seed{{/if}}",
              "{{#if dbOperation == 'reset'}}npx prisma migrate reset --force{{/if}}"
            ],
            executeParallel: false
          },
          {
            name: "Start Development Servers",
            executeCommands: [
              "npm run dev:api",
              "npm run dev:worker"
            ],
            executeParallel: true
          }
        ]
      }
    ]
  };

  return NextResponse.json(exampleConfig);
}
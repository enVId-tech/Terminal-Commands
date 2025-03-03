// app/documentation.tsx
'use client';

import React from 'react';
import styles from '@/styles/documentation.module.scss';

const Documentation = () => {
  return (
    <div className={styles.container}>
      <h1>JSON Configuration Structure</h1>
      <p>This document explains the structure of the JSON configuration used to define CLI commands in the application.</p>

      <h2>Root Structure</h2>
      <pre>
        <code>
{`{
  "commands": [
    {
      "name": "CommandName",
      "execute": "command to execute",
      "options": [],
      "subcommands": []
    }
  ]
}`}
        </code>
      </pre>

      <h2>Command Object</h2>
      <p>Each command object can have the following properties:</p>
      <ul>
        <li><code>name</code> (string): The name of the command.</li>
        <li><code>execute</code> (string or object): The command to execute. If it's an object, it maps different execution commands based on user input.</li>
        <li><code>options</code> (array): An array of option objects that define the inputs required for the command.</li>
        <li><code>subcommands</code> (array): An array of subcommand objects, which follow the same structure as the command object.</li>
      </ul>

      <h3>Example</h3>
      <pre>
        <code>
{`{
  "name": "Build",
  "execute": "npm run build -- --env={{buildType}} {{#if minify}}--minify{{/if}}",
  "options": [
    {
      "type": "list",
      "name": "buildType",
      "message": "Select build configuration:",
      "choices": ["Development", "Production", "Staging"]
    },
    {
      "type": "confirm",
      "name": "minify",
      "message": "Minify the output?",
      "default": false
    }
  ],
  "subcommands": []
}`}
        </code>
      </pre>

      <h2>Option Object</h2>
      <p>Each option object can have the following properties:</p>
      <ul>
        <li><code>type</code> (string): The type of input (e.g., <code>input</code>, <code>confirm</code>, <code>list</code>, <code>checkbox</code>).</li>
        <li><code>name</code> (string): The name of the option, used as a key in the answers object.</li>
        <li><code>message</code> (string): The message to display to the user.</li>
        <li><code>choices</code> (array, optional): An array of choices for <code>list</code> or <code>checkbox</code> types.</li>
        <li><code>default</code> (any, optional): The default value for the option.</li>
        <li><code>validate</code> (string, optional): A string representation of a validation function.</li>
      </ul>

      <h3>Example</h3>
      <pre>
        <code>
{`{
  "type": "list",
  "name": "buildType",
  "message": "Select build configuration:",
  "choices": ["Development", "Production", "Staging"]
}`}
        </code>
      </pre>

      <h2>Subcommand Object</h2>
      <p>Subcommand objects follow the same structure as the command object and can be nested to any depth.</p>

      <h3>Example</h3>
      <pre>
        <code>
{`{
  "name": "Deploy",
  "subcommands": [
    {
      "name": "Production",
      "execute": "npm run deploy -- --env=production"
    },
    {
      "name": "Staging",
      "execute": "npm run deploy -- --env=staging"
    }
  ]
}`}
        </code>
      </pre>

      <h2>Full Example</h2>
      <p>Here is a full example of a JSON configuration with multiple commands, options, and subcommands:</p>
      <pre>
        <code>
{`{
  "commands": [
    {
      "name": "Build",
      "execute": "npm run build -- --env={{buildType}} {{#if minify}}--minify{{/if}}",
      "options": [
        {
          "type": "list",
          "name": "buildType",
          "message": "Select build configuration:",
          "choices": ["Development", "Production", "Staging"]
        },
        {
          "type": "confirm",
          "name": "minify",
          "message": "Minify the output?",
          "default": false
        }
      ],
      "subcommands": []
    },
    {
      "name": "Deploy",
      "subcommands": [
        {
          "name": "Production",
          "execute": "npm run deploy -- --env=production"
        },
        {
          "name": "Staging",
          "execute": "npm run deploy -- --env=staging"
        }
      ]
    }
  ]
}`}
        </code>
      </pre>
    </div>
  );
};

export default Documentation;
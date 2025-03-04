// app/documentation/page.tsx
'use client';

import React, { useState } from 'react';
import styles from '@/styles/documentation.module.scss';
import Link from 'next/link';

const Documentation = () => {
    const [activeTab, setActiveTab] = useState<string>('overview');

    return (
        <div className={styles.documentationContainer}>
            <header className={styles.docHeader}>
                <h1>CLI Command Builder Documentation</h1>
                <Link href="/" className={styles.backButton}>Back to Builder</Link>
            </header>

            <div className={styles.tabNavigation}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'overview' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'ui' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('ui')}
                >
                    Using the UI
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'structure' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('structure')}
                >
                    File Structure
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'options' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('options')}
                >
                    Command Options
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'examples' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('examples')}
                >
                    Examples
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'hierarchy' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('hierarchy')}
                >
                    Command Hierarchy
                </button>
            </div>

            {activeTab === 'hierarchy' && (
              <section className={styles.hierarchySection}>
                <h2>Command Hierarchy</h2>

                <div className={styles.hierarchyIntro}>
                  <p>
                    Understanding the relationship between Commands, Subcommands, and Options is crucial
                    for building effective CLI tools. This hierarchy defines the structure and flow
                    of your command-line interface.
                  </p>

                  <div className={styles.hierarchyDiagram}>
                    <div className={`${styles.diagramNode} ${styles.rootNode}`}>
                      <strong>Command</strong>
                    </div>
                    <div className={styles.diagramArrows}>
                      <div className={styles.diagramArrow}></div>
                      <div className={styles.diagramArrow}></div>
                    </div>
                    <div className={styles.diagramLevel}>
                      <div className={`${styles.diagramNode} ${styles.subNode}`}>
                        <strong>Options</strong>
                      </div>
                      <div className={`${styles.diagramNode} ${styles.subNode}`}>
                        <strong>Subcommands</strong>
                      </div>
                    </div>
                    <div className={styles.diagramArrows}>
                      <div className={styles.diagramArrow}></div>
                    </div>
                    <div className={styles.diagramLevel}>
                      <div className={`${styles.diagramNode} ${styles.leafNode}`}>
                        <strong>Options</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.hierarchyDetail}>
                  <h3>Commands</h3>
                  <div className={styles.hierarchyDefinition}>
                    <div className={styles.definitionCard}>
                      <h4>What is a Command?</h4>
                      <p>
                        A command is the primary entry point for a specific functionality in your CLI.
                        Commands represent high-level actions that users can perform.
                      </p>
                      <p>
                        Each command can have its own options and subcommands, allowing for a
                        hierarchical structure of functionality.
                      </p>
                    </div>

                    <div className={styles.exampleCard}>
                      <h4>Example Use Cases</h4>
                      <ul>
                        <li>
                          <strong>Build operations:</strong> compiling, bundling, packaging
                        </li>
                        <li>
                          <strong>Deployment actions:</strong> deploy to dev, staging, production
                        </li>
                        <li>
                          <strong>Data operations:</strong> import, export, transform
                        </li>
                        <li>
                          <strong>Infrastructure management:</strong> provision, scale, terminate
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className={styles.codeExample}>
                    <h4>Command Example</h4>
                    <pre className={styles.codeBlock}>
                      <code>
            {`{
              "commands": [
                {
                  "name": "build",
                  "executeCommands": [
                    "echo Building project...",
                    "npm run build"
                  ]
                },
                {
                  "name": "deploy",
                  "executeCommands": [
                    "echo Deploying project...",
                    "npm run deploy"
                  ]
                }
              ]
            }`}
                      </code>
                    </pre>
                  </div>
                </div>

                <div className={styles.hierarchyDetail}>
                  <h3>Subcommands</h3>
                  <div className={styles.hierarchyDefinition}>
                    <div className={styles.definitionCard}>
                      <h4>What are Subcommands?</h4>
                      <p>
                        Subcommands are nested commands that belong to a parent command. They allow you
                        to create a hierarchical structure of commands, organizing related functionality.
                      </p>
                      <p>
                        Subcommands help in categorizing actions and providing a more intuitive command
                        structure. They can have their own options, just like top-level commands.
                      </p>
                    </div>

                    <div className={styles.exampleCard}>
                      <h4>When to Use Subcommands</h4>
                      <ul>
                        <li>
                          <strong>Logical grouping:</strong> When commands naturally fall into categories
                        </li>
                        <li>
                          <strong>Complex workflows:</strong> Breaking down multi-step processes
                        </li>
                        <li>
                          <strong>Resource operations:</strong> e.g., <code>user create</code>, <code>user delete</code>
                        </li>
                        <li>
                          <strong>Feature variations:</strong> Different modes of the same command
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className={styles.codeExample}>
                    <h4>Subcommand Example</h4>
                    <pre className={styles.codeBlock}>
                      <code>
            {`{
              "commands": [
                {
                  "name": "user",
                  "subcommands": [
                    {
                      "name": "create",
                      "executeCommands": [
                        "echo Creating new user..."
                      ]
                    },
                    {
                      "name": "delete",
                      "executeCommands": [
                        "echo Deleting user..."
                      ]
                    }
                  ]
                }
              ]
            }`}
                      </code>
                    </pre>
                  </div>
                </div>

                <div className={styles.hierarchyDetail}>
                  <h3>Options</h3>
                  <div className={styles.hierarchyDefinition}>
                    <div className={styles.definitionCard}>
                      <h4>What are Options?</h4>
                      <p>
                        Options are interactive prompts that collect user input. They allow your commands
                        to be flexible and customizable based on user preferences and requirements.
                      </p>
                      <p>
                        Options can be added to both commands and subcommands, and their values can be used
                        in command execution through Handlebars templates.
                      </p>
                    </div>

                    <div className={styles.exampleCard}>
                      <h4>Common Option Types</h4>
                      <ul>
                        <li><strong>Input:</strong> Free-form text entry</li>
                        <li><strong>List:</strong> Selection from predefined choices</li>
                        <li><strong>Checkbox:</strong> Multiple selections</li>
                        <li><strong>Confirm:</strong> Yes/No questions</li>
                        <li><strong>Number:</strong> Numeric input</li>
                        <li><strong>Password:</strong> Masked input for sensitive data</li>
                      </ul>
                    </div>
                  </div>

                  <div className={styles.codeExample}>
                    <h4>Options Example</h4>
                    <pre className={styles.codeBlock}>
                      <code>
            {`{
              "commands": [
                {
                  "name": "deploy",
                  "options": [
                    {
                      "type": "list",
                      "name": "environment",
                      "message": "Select deployment environment",
                      "choices": ["dev", "staging", "production"]
                    },
                    {
                      "type": "confirm",
                      "name": "skipTests",
                      "message": "Skip pre-deployment tests?",
                      "default": false
                    }
                  ],
                  "executeCommands": [
                    "echo Deploying to {{environment}} environment",
                    "{{#unless skipTests}}npm run test{{/unless}}",
                    "npm run deploy:{{environment}}"
                  ]
                }
              ]
            }`}
                      </code>
                    </pre>
                  </div>
                </div>

                <div className={styles.hierarchyCheatsheet}>
                  <h3>Command Hierarchy Cheatsheet</h3>
                  <table className={styles.propertyTable}>
                    <thead>
                      <tr>
                        <th>Level</th>
                        <th>Purpose</th>
                        <th>Can Have Options</th>
                        <th>Can Execute Commands</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Command</td>
                        <td>Top-level action or category</td>
                        <td>Yes</td>
                        <td>Yes</td>
                      </tr>
                      <tr>
                        <td>Subcommand</td>
                        <td>Nested action within a command</td>
                        <td>Yes</td>
                        <td>Yes</td>
                      </tr>
                      <tr>
                        <td>Option</td>
                        <td>User input collection</td>
                        <td>No</td>
                        <td>No</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <div className={styles.docContent}>
                {activeTab === 'overview' && (
                    <section>
                        <h2>Overview</h2>
                        <p>
                            The CLI Command Builder is a powerful tool that allows you to create interactive command-line interfaces
                            through a visual editor or by directly editing JSON/YAML configurations. The system consists of two main parts:
                        </p>

                        <div className={styles.featureGrid}>
                            <div className={styles.featureCard}>
                                <h3>Web Interface</h3>
                                <p>A visual editor for creating and managing your command configurations</p>
                                <ul>
                                    <li>Create, edit, and organize commands</li>
                                    <li>Add options and subcommands</li>
                                    <li>Import and export configurations</li>
                                    <li>Switch between JSON and YAML formats</li>
                                </ul>
                            </div>

                            <div className={styles.featureCard}>
                                <h3>CLI Tool</h3>
                                <p>A command-line interface that reads your configuration and executes commands</p>
                                <ul>
                                    <li>Interactive prompts for command options</li>
                                    <li>Support for parallel command execution</li>
                                    <li>Templating with Handlebars for dynamic command generation</li>
                                    <li>Multiple configuration file support</li>
                                </ul>
                            </div>
                        </div>

                        <div className={styles.workflowDiagram}>
                            <h3>How It Works</h3>
                            <div className={styles.diagram}>
                                <div className={styles.step}>
                                    <div className={styles.stepNumber}>1</div>
                                    <p>Create configuration using the web interface</p>
                                </div>
                                <div className={styles.arrow}>→</div>
                                <div className={styles.step}>
                                    <div className={styles.stepNumber}>2</div>
                                    <p>Save as JSON or YAML file</p>
                                </div>
                                <div className={styles.arrow}>→</div>
                                <div className={styles.step}>
                                    <div className={styles.stepNumber}>3</div>
                                    <p>Run CLI tool to execute commands</p>
                                </div>
                                <div className={styles.arrow}>→</div>
                                <div className={styles.step}>
                                    <div className={styles.stepNumber}>4</div>
                                    <p>Interactive prompts guide users through command options</p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'ui' && (
                    <section>
                        <h2>Using the UI</h2>

                        <div className={styles.uiSection}>
                            <h3>Main Interface</h3>
                            <p>The main interface consists of the following components:</p>
                            <div className={styles.uiScreenshot}>
                                {/* You would need to replace with actual screenshots */}
                                <div className={styles.imagePlaceholder}>
                                    <p>Main Interface Screenshot</p>
                                </div>
                            </div>

                            <ol className={styles.numberedList}>
                                <li>
                                    <strong>Command Sidebar:</strong> Lists all commands in your configuration. Click on a command to edit it.
                                </li>
                                <li>
                                    <strong>Editor Area:</strong> Edit the selected command's properties, options, and subcommands.
                                </li>
                                <li>
                                    <strong>Configuration Management:</strong> Buttons for importing, exporting, and managing your configuration.
                                </li>
                                <li>
                                    <strong>Format Toggle:</strong> Switch between JSON and YAML formats.
                                </li>
                                <li>
                                    <strong>Raw Editor:</strong> Edit the raw JSON or YAML configuration directly.
                                </li>
                            </ol>
                        </div>

                        <div className={styles.uiSection}>
                            <h3>Creating a New Command</h3>
                            <ol className={styles.numberedList}>
                                <li>Click the "Add Command" button in the command sidebar.</li>
                                <li>Enter a name for your command.</li>
                                <li>
                                    Add command execution instructions using one or more of the following:
                                    <ul>
                                        <li>
                                            <strong>Execute Commands:</strong> Add one or more shell commands to execute.
                                        </li>
                                        <li>
                                            <strong>Execute Parallel:</strong> Enable to run commands in parallel (simultaneously).
                                        </li>
                                        <li>
                                            <strong>Require Execution Choice:</strong> Ask the user whether to run in parallel or sequentially.
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    Optionally, add options to make your command interactive (see Options section).
                                </li>
                                <li>
                                    Optionally, add subcommands to create a nested command structure.
                                </li>
                            </ol>
                        </div>

                        <div className={styles.uiSection}>
                            <h3>Importing and Exporting</h3>
                            <p>You can import and export your configurations using the buttons in the Configuration Management section:</p>
                            <ul>
                                <li>
                                    <strong>Import Config:</strong> Import an existing JSON or YAML configuration file.
                                </li>
                                <li>
                                    <strong>Export Config:</strong> Export your current configuration as JSON or YAML.
                                </li>
                                <li>
                                    <strong>Load Example Config:</strong> Load a pre-configured example to get started quickly.
                                </li>
                            </ul>
                        </div>

                        <div className={styles.uiSection}>
                            <h3>Selection Tree View</h3>
                            <p>
                                The Selection Tree View shows the hierarchical structure of your commands, options, and default values.
                                This provides a clear visualization of how your command interface will appear to users.
                            </p>
                            <div className={styles.uiScreenshot}>
                                <div className={styles.imagePlaceholder}>
                                    <p>Selection Tree View Screenshot</p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'structure' && (
                    <section>
                        <h2>File Structure</h2>

                        <div className={styles.formatComparison}>
                            <h3>JSON vs YAML Format</h3>
                            <div className={styles.compareColumns}>
                                <div className={styles.compareColumn}>
                                    <h4>JSON Format</h4>
                                    <pre className={styles.codeBlock}>
                    <code>
{`{
  "commands": [
    {
      "name": "Build Project",
      "options": [
        {
          "type": "list",
          "name": "buildType",
          "message": "Select build configuration",
          "choices": [
            "development",
            "production",
            "staging"
          ]
        },
        {
          "type": "confirm",
          "name": "minify",
          "message": "Minify the output?",
          "default": false
        }
      ],
      "executeCommands": [
        "npm run build -- --env={{buildType}} {{#if minify}}--minify{{/if}}",
        "echo Build completed for {{buildType}} environment"
      ],
      "executeParallel": false,
      "requireExecutionChoice": true
    }
  ]
}`}
                    </code>
                  </pre>
                                </div>

                                <div className={styles.compareColumn}>
                                    <h4>YAML Format</h4>
                                    <pre className={styles.codeBlock}>
                    <code>
{`commands:
  - name: Build Project
    options:
      - type: list
        name: buildType
        message: Select build configuration
        choices:
          - development
          - production
          - staging
      - type: confirm
        name: minify
        message: Minify the output?
        default: false
    executeCommands:
      - npm run build -- --env={{buildType}} {{#if minify}}--minify{{/if}}
      - echo Build completed for {{buildType}} environment
    executeParallel: false
    requireExecutionChoice: true`}
                    </code>
                  </pre>
                                </div>
                            </div>
                        </div>

                        <div className={styles.structureSection}>
                            <h3>Root Structure</h3>
                            <p>
                                Both JSON and YAML configurations have the same basic structure:
                            </p>
                            <ul>
                                <li><code>commands</code>: An array of command objects that define your CLI interface.</li>
                            </ul>
                        </div>

                        <div className={styles.structureSection}>
                            <h3>Command Object</h3>
                            <p>Each command object can have the following properties:</p>
                            <table className={styles.propertyTable}>
                                <thead>
                                <tr>
                                    <th>Property</th>
                                    <th>Type</th>
                                    <th>Required</th>
                                    <th>Description</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td><code>name</code></td>
                                    <td>String</td>
                                    <td>Yes</td>
                                    <td>The name of the command shown in the selection menu</td>
                                </tr>
                                <tr>
                                    <td><code>execute</code></td>
                                    <td>String</td>
                                    <td>No</td>
                                    <td>Legacy property for single command (use executeCommands instead)</td>
                                </tr>
                                <tr>
                                    <td><code>executeCommands</code></td>
                                    <td>Array of Strings</td>
                                    <td>No</td>
                                    <td>Commands to execute when this option is selected</td>
                                </tr>
                                <tr>
                                    <td><code>executeParallel</code></td>
                                    <td>Boolean</td>
                                    <td>No</td>
                                    <td>Whether to execute commands in parallel (default: false)</td>
                                </tr>
                                <tr>
                                    <td><code>requireExecutionChoice</code></td>
                                    <td>Boolean</td>
                                    <td>No</td>
                                    <td>Ask user whether to run in parallel or sequentially</td>
                                </tr>
                                <tr>
                                    <td><code>options</code></td>
                                    <td>Array of Option objects</td>
                                    <td>No</td>
                                    <td>Interactive options to prompt the user for input</td>
                                </tr>
                                <tr>
                                    <td><code>subcommands</code></td>
                                    <td>Array of Command objects</td>
                                    <td>No</td>
                                    <td>Nested commands under this command</td>
                                </tr>
                                <tr>
                                    <td><code>postExecuteCommands</code></td>
                                    <td>Array of Strings</td>
                                    <td>No</td>
                                    <td>Commands to execute after the main commands complete</td>
                                </tr>
                                <tr>
                                    <td><code>postExecuteParallel</code></td>
                                    <td>Boolean</td>
                                    <td>No</td>
                                    <td>Whether to execute post-commands in parallel (default: false)</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className={styles.structureSection}>
                            <h3>Creating Configuration Files Manually</h3>
                            <p>
                                If you prefer to create your configuration files manually without using the UI, follow these steps:
                            </p>

                            <h4>For JSON:</h4>
                            <ol className={styles.numberedList}>
                                <li>Create a file with a <code>.json</code> extension.</li>
                                <li>
                                    Start with the root structure:
                                    <pre className={styles.codeBlock}>
                    <code>
{`{
  "commands": []
}`}
                    </code>
                  </pre>
                                </li>
                                <li>
                                    Add command objects to the <code>commands</code> array following the structure documented above.
                                </li>
                                <li>
                                    Validate your JSON using a JSON validator to ensure it's properly formatted.
                                </li>
                            </ol>

                            <h4>For YAML:</h4>
                            <ol className={styles.numberedList}>
                                <li>Create a file with a <code>.yml</code> or <code>.yaml</code> extension.</li>
                                <li>
                                    Start with the root structure:
                                    <pre className={styles.codeBlock}>
                    <code>
{`commands:
  - # Your first command here`}
                    </code>
                  </pre>
                                </li>
                                <li>
                                    Add command objects to the <code>commands</code> array following the structure documented above.
                                </li>
                                <li>
                                    Make sure to maintain proper indentation, as YAML is indentation-sensitive.
                                </li>
                            </ol>
                        </div>
                    </section>
                )}

                {activeTab === 'options' && (
                    <section>
                        <h2>Command Options</h2>

                        <div className={styles.optionsSection}>
                            <p>
                                Options allow you to make your commands interactive by prompting the user for input.
                                The CLI tool uses the popular Inquirer.js library to display these prompts.
                            </p>

                            <h3>Option Object Structure</h3>
                            <table className={styles.propertyTable}>
                                <thead>
                                <tr>
                                    <th>Property</th>
                                    <th>Type</th>
                                    <th>Required</th>
                                    <th>Description</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td><code>type</code></td>
                                    <td>String</td>
                                    <td>Yes</td>
                                    <td>The type of input prompt</td>
                                </tr>
                                <tr>
                                    <td><code>name</code></td>
                                    <td>String</td>
                                    <td>Yes</td>
                                    <td>Variable name used in command templates</td>
                                </tr>
                                <tr>
                                    <td><code>message</code></td>
                                    <td>String</td>
                                    <td>Yes</td>
                                    <td>The prompt message shown to the user</td>
                                </tr>
                                <tr>
                                    <td><code>default</code></td>
                                    <td>Any</td>
                                    <td>No</td>
                                    <td>Default value for the option</td>
                                </tr>
                                <tr>
                                    <td><code>choices</code></td>
                                    <td>Array</td>
                                    <td>Only for list/checkbox</td>
                                    <td>Available choices for list or checkbox prompts</td>
                                </tr>
                                <tr>
                                    <td><code>validate</code></td>
                                    <td>String</td>
                                    <td>No</td>
                                    <td>Validation function as string (will be evaluated)</td>
                                </tr>
                                </tbody>
                            </table>

                            <h3>Available Option Types</h3>
                            <div className={styles.optionTypes}>
                                <div className={styles.optionType}>
                                    <h4>Input</h4>
                                    <p>Standard text input field</p>
                                    <pre className={styles.codeBlock}>
                    <code>
{`{
  "type": "input",
  "name": "projectName",
  "message": "Enter project name:",
  "default": "my-project"
}`}
                    </code>
                  </pre>
                                </div>

                                <div className={styles.optionType}>
                                    <h4>List</h4>
                                    <p>Single-select dropdown menu</p>
                                    <pre className={styles.codeBlock}>
                    <code>
{`{
  "type": "list",
  "name": "framework",
  "message": "Select a framework:",
  "choices": [
    "React",
    "Vue",
    "Angular"
  ],
  "default": "React"
}`}
                    </code>
                  </pre>
                                </div>

                                <div className={styles.optionType}>
                                    <h4>Checkbox</h4>
                                    <p>Multi-select checklist</p>
                                    <pre className={styles.codeBlock}>
                    <code>
{`{
  "type": "checkbox",
  "name": "features",
  "message": "Select features to install:",
  "choices": [
    "Typescript",
    "Router",
    "State Management",
    "Testing"
  ]
}`}
                    </code>
                  </pre>
                                </div>

                                <div className={styles.optionType}>
                                    <h4>Confirm</h4>
                                    <p>Yes/No question</p>
                                    <pre className={styles.codeBlock}>
                    <code>
{`{
  "type": "confirm",
  "name": "useTypeScript",
  "message": "Use TypeScript?",
  "default": true
}`}
                    </code>
                  </pre>
                                </div>

                                <div className={styles.optionType}>
                                    <h4>Number</h4>
                                    <p>Numeric input field</p>
                                    <pre className={styles.codeBlock}>
                    <code>
{`{
  "type": "number",
  "name": "port",
  "message": "Enter port number:",
  "default": 3000
}`}
                    </code>
                  </pre>
                                </div>

                                <div className={styles.optionType}>
                                    <h4>Password</h4>
                                    <p>Masked text input for sensitive information</p>
                                    <pre className={styles.codeBlock}>
                    <code>
{`{
  "type": "password",
  "name": "apiKey",
  "message": "Enter your API key:"
}`}
                    </code>
                  </pre>
                                </div>

                                <div className={styles.optionType}>
                                    <h4>Editor</h4>
                                    <p>Opens a text editor for multi-line input</p>
                                    <pre className={styles.codeBlock}>
                    <code>
{`{
  "type": "editor",
  "name": "description",
  "message": "Enter project description:"
}`}
                    </code>
                  </pre>
                                </div>
                            </div>

                            <h3>Using Values in Commands</h3>
                            <p>
                                You can use the values entered by the user in your commands using Handlebars syntax:
                            </p>
                            <pre className={styles.codeBlock}>
                <code>
{`# Simple variable
npm install {{packageName}}

# Conditional statement
npm run build {{#if minify}}--minify{{/if}}

# Ternary operator
docker run {{#if useTypeScript}}typescript-image{{else}}javascript-image{{/if}}

# Comparison operator
{{#if database == 'postgres'}}pg_start{{else if database == 'mysql'}}mysql_start{{else}}mongo_start{{/if}}`}
                </code>
              </pre>
                        </div>
                    </section>
                )}

                {activeTab === 'examples' && (
                    <section>
                        <h2>Examples</h2>

                        <div className={styles.exampleSection}>
                            <h3>Basic Project Build Command</h3>
                            <p>
                                This example creates a build command with environment and minification options.
                            </p>
                            <pre className={styles.codeBlock}>
                <code>
{`{
  "commands": [
    {
      "name": "Build Project",
      "options": [
        {
          "type": "list",
          "name": "buildType",
          "message": "Select build configuration",
          "choices": ["development", "production", "staging"]
        },
        {
          "type": "confirm",
          "name": "minify",
          "message": "Minify the output?",
          "default": false
        }
      ],
      "executeCommands": [
        "npm run build -- --env={{buildType}} {{#if minify}}--minify{{/if}}",
        "echo Build completed for {{buildType}} environment"
      ]
    }
  ]
}`}
                </code>
              </pre>
                        </div>

                        <div className={styles.exampleSection}>
                            <h3>Project Setup with Parallel Commands</h3>
                            <p>
                                This example sets up a project with multiple commands running in parallel.
                            </p>
                            <pre className={styles.codeBlock}>
                <code>
{`{
  "commands": [
    {
      "name": "Install & Setup",
      "executeCommands": [
        "npm install",
        "npx husky install",
        "cp .env.example .env"
      ],
      "executeParallel": true,
      "requireExecutionChoice": true
    }
  ]
}`}
                </code>
              </pre>
                        </div>

                        <div className={styles.exampleSection}>
                            <h3>Command with Subcommands</h3>
                            <p>
                                This example creates a Docker commands group with subcommands.
                            </p>
                            <pre className={styles.codeBlock}>
                <code>
{`{
  "commands": [
    {
      "name": "Docker Operations",
      "subcommands": [
        {
          "name": "Start Containers",
          "executeCommands": [
            "docker-compose up -d",
            "echo Docker containers started successfully"
          ]
        },
        {
          "name": "Stop Containers",
          "executeCommands": [
            "docker-compose down",
            "echo Docker containers stopped"
          ]
        }
      ]
    }
  ]
}`}
                </code>
              </pre>
                        </div>

                        <div className={styles.exampleSection}>
                            <h3>Advanced Database Setup</h3>
                            <p>
                                This example creates a complex database setup with multiple options and post-execution commands.
                            </p>
                            <pre className={styles.codeBlock}>
                <code>
{`{
  "commands": [
    {
      "name": "Database Setup",
      "options": [
        {
          "type": "list",
          "name": "dbType",
          "message": "Select database type",
          "choices": ["mysql", "postgres", "mongodb"]
        },
        {
          "type": "input",
          "name": "dbName",
          "message": "Enter database name",
          "default": "myapp"
        },
        {
          "type": "password",
          "name": "dbPassword",
          "message": "Enter database password"
        },
        {
          "type": "number",
          "name": "port",
          "message": "Enter database port",
          "default": 5432
        }
      ],
      "executeCommands": [
        "docker run -d --name {{dbName}} -p {{port}}:{{port}} -e POSTGRES_PASSWORD={{dbPassword}} {{#if dbType == 'postgres'}}postgres{{else if dbType == 'mysql'}}mysql{{else}}mongo{{/if}}"
      ],
      "postExecuteCommands": [
        "echo Database setup complete",
        "echo Connect using port {{port}}"
      ]
    }
  ]
}`}
                </code>
              </pre>
                        </div>

                        <div className={styles.exampleSection}>
                            <h3>Full Project Configuration (YAML Format)</h3>
                            <p>
                                This example shows a complete configuration with multiple commands, options, and subcommands in YAML format.
                            </p>
                            <pre className={styles.codeBlock}>
                <code>
{`commands:
  - name: Build Project
    options:
      - type: list
        name: buildType
        message: Select build configuration
        choices:
          - development
          - production
          - staging
      - type: confirm
        name: minify
        message: Minify the output?
        default: false
    executeCommands:
      - npm run build -- --env={{buildType}} {{#if minify}}--minify{{/if}}
      - echo Build completed for {{buildType}} environment
    executeParallel: false
    requireExecutionChoice: true

  - name: Install & Setup
    executeCommands:
      - npm install
      - npx husky install
      - cp .env.example .env
    executeParallel: true
    requireExecutionChoice: true

  - name: Docker Operations
    subcommands:
      - name: Start Containers
        executeCommands:
          - docker-compose up -d
          - echo Docker containers started successfully
        executeParallel: false
        requireExecutionChoice: true

      - name: Database Setup
        options:
          - type: list
            name: dbType
            message: Select database type
            choices:
              - mysql
              - postgres
              - mongodb
          - type: input
            name: dbName
            message: Enter database name
            default: myapp
          - type: password
            name: dbPassword
            message: Enter database password
          - type: number
            name: port
            message: Enter database port
            default: 5432
        executeCommands:
          - docker run -d --name {{dbName}} -p {{port}}:{{port}} -e POSTGRES_PASSWORD={{dbPassword}} {{#if dbType == 'postgres'}}postgres{{else if dbType == 'mysql'}}mysql{{else}}mongo{{/if}}
        executeParallel: false
        postExecuteCommands:
          - echo Database setup complete
          - echo Connect using port {{port}}
        postExecuteParallel: false`}
                </code>
              </pre>
                        </div>

                        <div className={styles.exampleSection}>
                            <h3>Creating Configuration Without the UI</h3>
                            <p>
                                Follow these steps to create a configuration file manually without using the UI:
                            </p>

                            <div className={styles.manualSteps}>
                                <div className={styles.step}>
                                    <h4>1. Create an empty file</h4>
                                    <p>Create a file named <code>commands.json</code> or <code>commands.yaml</code></p>
                                </div>

                                <div className={styles.step}>
                                    <h4>2. Add the basic structure</h4>
                                    <p>For JSON:</p>
                                    <pre className={styles.codeBlock}>
                    <code>
{`{
  "commands": []
}`}
                    </code>
                  </pre>
                                    <p>For YAML:</p>
                                    <pre className={styles.codeBlock}>
                    <code>
{`commands: []`}
                    </code>
                  </pre>
                                </div>

                                <div className={styles.step}>
                                    <h4>3. Add your commands</h4>
                                    <p>Add command objects to the commands array using the examples above as templates.</p>
                                </div>

                                <div className={styles.step}>
                                    <h4>4. Save the file</h4>
                                    <p>Save the file in the <code>data</code> directory of the CLI tool.</p>
                                </div>

                                <div className={styles.step}>
                                    <h4>5. Run the CLI tool</h4>
                                    <p>Run the CLI tool and it will automatically detect and use your configuration file.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            <footer className={styles.docFooter}>
                <p>Erick Tran - CLI Command Builder Documentation — Building interactive command-line interfaces</p>
                <Link href="/" className={styles.backToTopButton}>Back to Top</Link>
            </footer>
        </div>
    );
};

export default Documentation;
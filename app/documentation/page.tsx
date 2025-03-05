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
                <button
                    className={`${styles.tabButton} ${activeTab === 'execution' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('execution')}
                >
                    Execution Flow
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'troubleshooting' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('troubleshooting')}
                >
                    Troubleshooting
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
                                <div className={styles.diagramArrow}></div>
                            </div>
                            <div className={styles.diagramLevel}>
                                <div className={`${styles.diagramNode} ${styles.subNode}`}>
                                    <strong>Options</strong>
                                </div>
                                <div className={`${styles.diagramNode} ${styles.subNode}`}>
                                    <strong>Execute Commands</strong>
                                </div>
                                <div className={`${styles.diagramNode} ${styles.subNode}`}>
                                    <strong>Subcommands</strong>
                                </div>
                            </div>
                            <div className={styles.diagramArrows}>
                                <div className={styles.diagramArrow}></div>
                                <div className={styles.diagramArrow}></div>
                                <div className={styles.diagramArrow}></div>
                            </div>
                            <div className={styles.diagramLevel}>
                                <div className={`${styles.diagramNode} ${styles.leafNode}`}>
                                    <strong>Options</strong>
                                </div>
                                <div className={`${styles.diagramNode} ${styles.leafNode}`}>
                                    <strong>Execute Commands</strong>
                                </div>
                                <div className={`${styles.diagramNode} ${styles.leafNode}`}>
                                    <strong>Nested Subcommands</strong>
                                    <small>(Unlimited Depth)</small>
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
                                    Each command can have its own options, execute commands and subcommands, allowing for a
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
      ],
      "executeParallel": false
    },
    {
      "name": "deploy",
      "executeCommands": [
        "echo Deploying project...",
        "npm run deploy"
      ],
      "executeParallel": false
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
                                    structure. They can have their own options, execute commands, and even deeper nested subcommands
                                    with unlimited nesting depth.
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
                                    <li>
                                        <strong>Deep hierarchies:</strong> When you need multiple levels of command selection
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
        },
        {
          "name": "manage",
          "subcommands": [
            {
              "name": "permissions",
              "executeCommands": [
                "echo Managing user permissions..."
              ]
            }
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
                                    Options can be added to both commands and subcommands at any nesting level, and their values can be used
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
                                    <li><strong>Editor:</strong> Multi-line text input in an editor</li>
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
                                <th>Can Have Children</th>
                                <th>Nesting Depth</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>Command</td>
                                <td>Top-level action or category</td>
                                <td>Yes</td>
                                <td>Yes</td>
                                <td>Yes (Subcommands)</td>
                                <td>Root</td>
                            </tr>
                            <tr>
                                <td>Subcommand</td>
                                <td>Nested action within a command</td>
                                <td>Yes</td>
                                <td>Yes</td>
                                <td>Yes (Nested Subcommands)</td>
                                <td>Unlimited</td>
                            </tr>
                            <tr>
                                <td>Option</td>
                                <td>User input collection</td>
                                <td>No</td>
                                <td>No</td>
                                <td>No</td>
                                <td>N/A</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {activeTab === 'execution' && (
                <section className={styles.executionSection}>
                    <h2>Execution Flow</h2>

                    <div className={styles.executionIntro}>
                        <p>
                            Understanding how commands and subcommands are executed is key to building effective CLI tools.
                            The execution flow determines the order in which commands are processed and how user inputs are collected.
                        </p>

                        <div className={styles.executionDiagram}>
                            <h3>Command Execution Sequence</h3>
                            <ol className={styles.executionSteps}>
                                <li>
                                    <strong>Command Selection</strong>
                                    <p>User selects a command from the root menu</p>
                                </li>
                                <li>
                                    <strong>Option Collection</strong>
                                    <p>If the command has options, prompt the user for inputs</p>
                                </li>
                                <li>
                                    <strong>Pre-Execution Commands</strong>
                                    <p>Run the command's executeCommands (if any)</p>
                                </li>
                                <li>
                                    <strong>Subcommand Selection</strong>
                                    <p>If the command has subcommands, prompt the user to select one</p>
                                </li>
                                <li>
                                    <strong>Subcommand Options</strong>
                                    <p>Collect options for the selected subcommand</p>
                                </li>
                                <li>
                                    <strong>Subcommand Execution</strong>
                                    <p>Execute the subcommand's commands</p>
                                </li>
                                <li>
                                    <strong>Nested Subcommands</strong>
                                    <p>Continue this pattern recursively for nested subcommands</p>
                                </li>
                                <li>
                                    <strong>Post-Execution Commands</strong>
                                    <p>Run any postExecuteCommands defined for the subcommand</p>
                                </li>
                            </ol>
                        </div>
                    </div>

                    <div className={styles.executionDetail}>
                        <h3>Deep Nesting Support</h3>
                        <p>
                            The CLI Command Builder supports unlimited nesting of subcommands. This means you can create
                            deeply nested command hierarchies like:
                        </p>
                        <pre className={styles.commandExample}>
                            <code>command → subcommand → nested-subcommand → deeper-nested-subcommand</code>
                        </pre>
                        <p>
                            Each level follows the same pattern of option collection, command execution, and subcommand handling.
                            All parent-level answers are passed down to child subcommands, allowing access to variables defined at any level.
                        </p>
                    </div>

                    <div className={styles.executionDetail}>
                        <h3>Variable Inheritance</h3>
                        <p>
                            Variables defined through options at any level are available to all subsequent commands and nested subcommands.
                            This creates a cascading inheritance pattern:
                        </p>

                        <div className={styles.inheritanceDiagram}>
                            <div className={styles.inheritanceLevel}>
                                <div className={styles.inheritanceNode}>
                                    <strong>Command Level</strong>
                                    <p>Variables: A, B</p>
                                </div>
                            </div>
                            <div className={styles.inheritanceArrow}>↓</div>
                            <div className={styles.inheritanceLevel}>
                                <div className={styles.inheritanceNode}>
                                    <strong>Subcommand Level</strong>
                                    <p>Variables: A, B, C</p>
                                    <small>(Inherits A, B + adds C)</small>
                                </div>
                            </div>
                            <div className={styles.inheritanceArrow}>↓</div>
                            <div className={styles.inheritanceLevel}>
                                <div className={styles.inheritanceNode}>
                                    <strong>Nested Subcommand Level</strong>
                                    <p>Variables: A, B, C, D</p>
                                    <small>(Inherits all previous + adds D)</small>
                                </div>
                            </div>
                        </div>

                        <p>
                            This inheritance allows for powerful templating where deeper commands can reference variables from any parent level.
                        </p>
                    </div>

                    <div className={styles.executionDetail}>
                        <h3>Parallel vs Sequential Execution</h3>

                        <div className={styles.executionModes}>
                            <div className={styles.executionMode}>
                                <h4>Sequential Execution (Default)</h4>
                                <p>
                                    Commands run one after another, waiting for each to complete before starting the next.
                                    This ensures a predictable order and is useful when commands depend on each other.
                                </p>
                                <pre className={styles.codeBlock}>
                                    <code>{`{
  "executeCommands": [
    "echo Step 1",
    "echo Step 2",
    "echo Step 3"
  ],
  "executeParallel": false
}`}</code>
                                </pre>
                            </div>

                            <div className={styles.executionMode}>
                                <h4>Parallel Execution</h4>
                                <p>
                                    All commands run simultaneously. This is faster but doesn't guarantee completion order.
                                    Best for independent commands that don't rely on each other.
                                </p>
                                <pre className={styles.codeBlock}>
                                    <code>{`{
  "executeCommands": [
    "echo Task 1",
    "echo Task 2",
    "echo Task 3"
  ],
  "executeParallel": true
}`}</code>
                                </pre>
                            </div>
                        </div>

                        <div className={styles.runtimeChoice}>
                            <h4>Runtime Selection</h4>
                            <p>
                                Using the <code>requireExecutionChoice</code> flag allows users to choose at runtime
                                whether commands should run in parallel or sequentially:
                            </p>
                            <pre className={styles.codeBlock}>
                                <code>{`{
  "executeCommands": [
    "echo Task 1",
    "echo Task 2"
  ],
  "requireExecutionChoice": true
}`}</code>
                            </pre>
                        </div>
                    </div>

                    <div className={styles.executionDetail}>
                        <h3>Template Variables</h3>
                        <p>
                            Command execution uses Handlebars templating to inject variables collected from options.
                            This allows dynamic command generation based on user input.
                        </p>

                        <div className={styles.templateExamples}>
                            <h4>Basic Variable Substitution</h4>
                            <pre className={styles.codeBlock}>
                                <code>{`{
  "options": [
    {
      "type": "input",
      "name": "projectName",
      "message": "Enter project name"
    }
  ],
  "executeCommands": [
    "mkdir {{projectName}}",
    "cd {{projectName}} && npm init -y"
  ]
}`}</code>
                            </pre>

                            <h4>Conditional Execution</h4>
                            <pre className={styles.codeBlock}>
                                <code>{`{
  "options": [
    {
      "type": "confirm",
      "name": "runTests",
      "message": "Run tests before deployment?"
    }
  ],
  "executeCommands": [
    "{{#if runTests}}npm test{{/if}}",
    "npm run deploy"
  ]
}`}</code>
                            </pre>

                            <h4>Looping Constructs</h4>
                            <pre className={styles.codeBlock}>
                                <code>{`{
  "options": [
    {
      "type": "checkbox",
      "name": "selectedModules",
      "message": "Select modules to build",
      "choices": ["auth", "api", "ui", "db"]
    }
  ],
  "executeCommands": [
    "{{#each selectedModules}}npm run build:{{this}}{{/each}}"
  ]
}`}</code>
                            </pre>
                        </div>
                    </div>

                    <div className={styles.troubleshootingTips}>
                        <h3>Common Execution Issues</h3>
                        <ul className={styles.troubleshootingList}>
                            <li>
                                <strong>Nested Subcommands Not Running</strong>
                                <p>
                                    Ensure your subcommands array is properly defined at each level. Check for typos or
                                    structure issues in your configuration file.
                                </p>
                            </li>
                            <li>
                                <strong>Variables Not Available</strong>
                                <p>
                                    Make sure option names match the variables used in commands. Check for case sensitivity
                                    and typos in Handlebars templates.
                                </p>
                            </li>
                            <li>
                                <strong>Parallel Command Issues</strong>
                                <p>
                                    When using parallel execution, ensure commands don't have interdependencies.
                                    For dependent commands, use sequential execution instead.
                                </p>
                            </li>
                        </ul>
                    </div>
                </section>
            )}

            {activeTab === 'troubleshooting' && (
                <section className={styles.troubleshootingSection}>
                    <h2>Troubleshooting</h2>

                    <div className={styles.troubleshootingIntro}>
                        <p>
                            Running into issues with your CLI commands? This section covers common problems and their solutions.
                        </p>
                    </div>

                    <div className={styles.commonIssues}>
                        <h3>Common Issues</h3>

                        <div className={styles.issueCard}>
                            <h4>Unable to initialize device PRN</h4>
                            <div className={styles.issueSolution}>
                                <p className={styles.issueDescription}>
                                    This Windows-specific error often occurs when trying to access a printer device or when there's
                                    a permission issue with device access.
                                </p>
                                <div className={styles.solutionSteps}>
                                    <h5>Solutions:</h5>
                                    <ol>
                                        <li>Run your command prompt or terminal as Administrator</li>
                                        <li>Check for redirections to printer devices (like <code>&gt; PRN</code>)</li>
                                        <li>Update your command to use proper path handling for Windows</li>
                                        <li>If using npm scripts, use <code>npm.cmd</code> instead of <code>npm</code> on Windows</li>
                                    </ol>

                                    <pre className={styles.codeBlock}>
                                        <code>{`// In your CLI handler, use platform-specific command execution:
const isWindows = process.platform === 'win32';
const executable = isWindows && cmd === 'npm' ? 'npm.cmd' : cmd;

// Use shell: true for better path handling
spawn(executable, args, { shell: true });`}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className={styles.issueCard}>
                            <h4>Nested Subcommands Not Running</h4>
                            <div className={styles.issueSolution}>
                                <p className={styles.issueDescription}>
                                    If your nested subcommands aren't executing properly, it's usually related to how the command
                                    structure is defined or how nested commands are processed.
                                </p>
                                <div className={styles.solutionSteps}>
                                    <h5>Solutions:</h5>
                                    <ol>
                                        <li>Verify your JSON/YAML structure has proper nesting</li>
                                        <li>Add debugging logs to trace execution flow</li>
                                        <li>Check that parent variables are being passed to child commands</li>
                                        <li>Ensure your recursive subcommand handling is correct</li>
                                    </ol>

                                    <pre className={styles.codeBlock}>
                                        <code>{`// Add debugging to your handleSubcommand function:
async function handleSubcommand(subcommand, answers, depth = 0) {
  console.log(\`Processing subcommand: \${subcommand.name} at depth \${depth}\`);
  console.log(\`Subcommand has \${subcommand.subcommands?.length || 0} nested subcommands\`);
  
  // The rest of your function...
  
  if (subcommand.subcommands && subcommand.subcommands.length > 0) {
    // When handling nested subcommand, pass incremented depth
    await handleSubcommand(selectedSubcommand, mergedAnswers, depth + 1);
  }
}`}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className={styles.issueCard}>
                            <h4>Command Selection Tree Navigation Issues</h4>
                            <div className={styles.issueSolution}>
                                <p className={styles.issueDescription}>
                                    If clicking on items in the selection tree doesn't properly navigate or highlight elements,
                                    there's likely an issue with DOM references or CSS classes.
                                </p>
                                <div className={styles.solutionSteps}>
                                    <h5>Solutions:</h5>
                                    <ol>
                                        <li>Ensure consistent data-id attributes are set on all elements</li>
                                        <li>Check that the highlightedElement prop is passed down through all components</li>
                                        <li>Verify CSS modules are properly imported in all components</li>
                                        <li>Add longer timeouts for DOM updates</li>
                                    </ol>

                                    <pre className={styles.codeBlock}>
                                        <code>{`// Enhance your navigateToElement function
const navigateToElement = (commandIndex, path = []) => {
  // Select the command first
  setActiveTab('editor');
  selectCommand(commandIndex);
  
  // Set timeout to allow DOM to update
  setTimeout(() => {
    const highlightId = path.length > 0
      ? \`cmd-\${commandIndex}-\${path.join('-')}\`
      : \`cmd-\${commandIndex}\`;
      
    console.log(\`Looking for element: \${highlightId}\`);
    setHighlightedElement(highlightId);
    
    // Scroll to element with longer timeout
    setTimeout(() => {
      const element = document.querySelector(\`[data-id="\${highlightId}"]\`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        console.log('Element found and scrolled to');
      } else {
        console.log('Element not found in DOM');
      }
    }, 500);
  }, 100);
}`}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.debuggingTips}>
                        <h3>Debugging Tips</h3>
                        <ul className={styles.tipsList}>
                            <li>
                                <strong>Enable verbose logging</strong> to trace command execution flow
                            </li>
                            <li>
                                <strong>Use temporary console.log statements</strong> at key points to understand execution order
                            </li>
                            <li>
                                <strong>Check your command line output</strong> for syntax errors in generated commands
                            </li>
                            <li>
                                <strong>Validate your JSON/YAML configuration</strong> with a validator tool
                            </li>
                            <li>
                                <strong>Try commands manually</strong> to verify they work outside of your CLI tool
                            </li>
                            <li>
                                <strong>Inspect environment variables</strong> that might affect command execution
                            </li>
                        </ul>
                    </div>

                    <div className={styles.commonSolutions}>
                        <h3>Quick Solution Reference</h3>
                        <table className={styles.solutionsTable}>
                            <thead>
                            <tr>
                                <th>Symptom</th>
                                <th>Common Cause</th>
                                <th>Solution</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>Command not found</td>
                                <td>Path issues or missing dependency</td>
                                <td>Use <code>shell: true</code> in spawn options</td>
                            </tr>
                            <tr>
                                <td>Variable not interpolated</td>
                                <td>Missing or misnamed variable</td>
                                <td>Check variable names match option names</td>
                            </tr>
                            <tr>
                                <td>PRN device errors</td>
                                <td>Windows-specific path issues</td>
                                <td>Use <code>npm.cmd</code> instead of <code>npm</code></td>
                            </tr>
                            <tr>
                                <td>Commands run out of order</td>
                                <td>Parallel execution when sequential needed</td>
                                <td>Set <code>executeParallel: false</code></td>
                            </tr>
                            <tr>
                                <td>Nested commands not running</td>
                                <td>Improper command structure or recursion</td>
                                <td>Add depth tracking to recursive functions</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {activeTab === 'overview' && (
                <section className={styles.overviewSection}>
                    <h2>Overview</h2>

                    <div className={styles.overviewContent}>
                        <div className={styles.introCard}>
                            <h3>What is CLI Command Builder?</h3>
                            <p>
                                CLI Command Builder is a powerful tool that allows you to create, organize, and manage command-line interfaces
                                through a visual editor. It generates configuration files that can be used with the CLI runner to execute
                                complex command sequences with interactive prompts.
                            </p>
                            <p>
                                Built with flexibility in mind, this tool supports nested command structures, various input types, conditional
                                execution, and template-based command generation using Handlebars syntax.
                            </p>
                        </div>

                        <div className={styles.featuresCard}>
                            <h3>Key Features</h3>
                            <ul className={styles.featuresList}>
                                <li><strong>Visual Command Builder</strong> - Create commands with an intuitive UI</li>
                                <li><strong>Unlimited Command Nesting</strong> - Build complex command hierarchies</li>
                                <li><strong>Interactive Prompts</strong> - Collect user input with various prompt types</li>
                                <li><strong>Templated Commands</strong> - Use variables in your commands with Handlebars</li>
                                <li><strong>Parallel Execution</strong> - Run commands sequentially or in parallel</li>
                                <li><strong>JSON/YAML Export</strong> - Save configurations in multiple formats</li>
                                <li><strong>Command Tree Navigation</strong> - Easily navigate complex command structures</li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.quickStartCard}>
                        <h3>Quick Start Guide</h3>
                        <ol className={styles.quickStartSteps}>
                            <li>Create a new command by clicking the "Add Command" button</li>
                            <li>Give your command a descriptive name</li>
                            <li>Add options to collect user input</li>
                            <li>Add execute commands that use the collected input</li>
                            <li>Optionally add subcommands for more complex workflows</li>
                            <li>Save your configuration and run it with the CLI runner</li>
                        </ol>
                    </div>

                    <div className={styles.systemRequirements}>
                        <h3>System Requirements</h3>
                        <ul>
                            <li><strong>Node.js:</strong> v23.6.0 or higher</li>
                            <li><strong>npm:</strong> v6.0.0 or higher</li>
                            <li><strong>Operating Systems:</strong> Windows, macOS, Linux</li>
                        </ul>
                    </div>
                </section>
            )}

            {activeTab === 'ui' && (
                <section className={styles.uiSection}>
                    <h2>Using the UI</h2>

                    <div className={styles.uiNavigation}>
                        <h3>UI Layout</h3>
                        <div className={styles.uiLayout}>
                            <div className={styles.uiLayoutItem}>
                                <h4>Command List Panel</h4>
                                <p>
                                    The left panel shows all your commands in a tree structure. You can:
                                </p>
                                <ul>
                                    <li>Add new commands with the "Add Command" button</li>
                                    <li>Select a command to edit its properties</li>
                                    <li>Navigate through subcommands by expanding tree nodes</li>
                                    <li>Reorder commands by dragging them</li>
                                </ul>
                            </div>

                            <div className={styles.uiLayoutItem}>
                                <h4>Editor Panel</h4>
                                <p>
                                    The central panel is where you edit the selected command:
                                </p>
                                <ul>
                                    <li>Change command name and description</li>
                                    <li>Manage options via the Options tab</li>
                                    <li>Configure execution commands via the Execute tab</li>
                                    <li>Create and manage subcommands via the Subcommands tab</li>
                                </ul>
                            </div>

                            <div className={styles.uiLayoutItem}>
                                <h4>Configuration Panel</h4>
                                <p>
                                    The right panel shows the current configuration:
                                </p>
                                <ul>
                                    <li>View the JSON/YAML representation</li>
                                    <li>Save configuration to a file</li>
                                    <li>Load existing configurations</li>
                                    <li>Copy configuration to clipboard</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className={styles.uiWorkflow}>
                        <h3>Working with the UI</h3>

                        <div className={styles.workflowStep}>
                            <h4>Creating Commands</h4>
                            <ol>
                                <li>Click "Add Command" in the command list panel</li>
                                <li>Enter a name for your command</li>
                                <li>Add description (optional)</li>
                                <li>Switch to the Execute tab to add command execution steps</li>
                            </ol>
                        </div>

                        <div className={styles.workflowStep}>
                            <h4>Adding Options</h4>
                            <ol>
                                <li>Select a command in the tree</li>
                                <li>Switch to the Options tab</li>
                                <li>Click "Add Option"</li>
                                <li>Configure the option type, name, message, and other properties</li>
                                <li>Add validation if needed</li>
                            </ol>
                        </div>

                        <div className={styles.workflowStep}>
                            <h4>Adding Subcommands</h4>
                            <ol>
                                <li>Select a command in the tree</li>
                                <li>Switch to the Subcommands tab</li>
                                <li>Click "Add Subcommand"</li>
                                <li>Configure the subcommand as you would a normal command</li>
                                <li>Add nested subcommands if needed</li>
                            </ol>
                        </div>
                    </div>

                    <div className={styles.uiTips}>
                        <h3>UI Tips and Tricks</h3>
                        <ul className={styles.tipsList}>
                            <li>
                                <strong>Command Selection Tree:</strong> Click on any element in the tree to jump to its editor form
                            </li>
                            <li>
                                <strong>Expanding Nodes:</strong> Click the arrow icons to expand/collapse command nodes in the tree
                            </li>
                            <li>
                                <strong>Drag and Drop:</strong> Reorder commands and subcommands by dragging them in the tree
                            </li>
                            <li>
                                <strong>Keyboard Shortcuts:</strong> Use Tab to navigate form fields and Ctrl+S to save
                            </li>
                            <li>
                                <strong>Search:</strong> Use the search box to quickly find commands in large configurations
                            </li>
                        </ul>
                    </div>
                </section>
            )}

            {activeTab === 'structure' && (
                <section className={styles.structureSection}>
                    <h2>File Structure</h2>

                    <div className={styles.fileStructureIntro}>
                        <p>
                            The CLI Command Builder uses JSON or YAML files to store command configurations.
                            Understanding the structure of these files is essential for advanced customization and debugging.
                        </p>
                    </div>

                    <div className={styles.fileFormatSection}>
                        <h3>File Formats</h3>
                        <div className={styles.formatComparison}>
                            <div className={styles.formatCard}>
                                <h4>JSON Format</h4>
                                <p>Standard JSON format, more compact but less forgiving of syntax errors.</p>
                                <pre className={styles.codeBlock}>
                                    <code>{`{
  "commands": [
    {
      "name": "build",
      "executeCommands": ["npm run build"]
    }
  ]
}`}</code>
                                </pre>
                            </div>

                            <div className={styles.formatCard}>
                                <h4>YAML Format</h4>
                                <p>More human-readable format with support for comments.</p>
                                <pre className={styles.codeBlock}>
                                    <code>{`# Command configuration
commands:
  - name: build
    executeCommands:
      - npm run build`}</code>
                                </pre>
                            </div>
                        </div>
                    </div>

                    <div className={styles.rootStructureSection}>
                        <h3>Root Structure</h3>
                        <p>
                            All configuration files have a root <code>commands</code> array that contains all top-level commands.
                        </p>
                        <pre className={styles.codeBlock}>
                            <code>{`{
  "commands": [
    // Command objects go here
  ]
}`}</code>
                        </pre>
                    </div>

                    <div className={styles.schemaSection}>
                        <h3>Schema Definition</h3>
                        <div className={styles.schemaDetail}>
                            <h4>Command Schema</h4>
                            <pre className={styles.codeBlock}>
                                <code>{`{
  "name": string,              // Command name
  "description"?: string,      // Optional description
  "options"?: Option[],        // Array of option objects
  "execute"?: string,          // Legacy: single command to execute
  "executeCommands"?: string[], // Array of commands to execute
  "executeParallel"?: boolean, // Whether to run commands in parallel
  "requireExecutionChoice"?: boolean, // Ask user about execution mode
  "subcommands"?: Subcommand[] // Array of subcommand objects
}`}</code>
                            </pre>
                        </div>

                        <div className={styles.schemaDetail}>
                            <h4>Option Schema</h4>
                            <pre className={styles.codeBlock}>
                                <code>{`{
  "type": "input" | "list" | "confirm" | "password" | "editor" | "checkbox" | "number",
  "name": string,              // Variable name for referencing
  "message": string,           // Prompt displayed to user
  "choices"?: string[],        // For list/checkbox types
  "default"?: any,             // Default value
  "validate"?: string          // Validation function
}`}</code>
                            </pre>
                        </div>

                        <div className={styles.schemaDetail}>
                            <h4>Subcommand Schema</h4>
                            <pre className={styles.codeBlock}>
                                <code>{`{
  "name": string,              // Subcommand name
  "options"?: Option[],        // Array of option objects
  "execute"?: string | Record<string, string>, // Legacy execution
  "executeCommands"?: string[], // Array of commands to execute
  "executeParallel"?: boolean, // Whether to run commands in parallel
  "requireExecutionChoice"?: boolean, // Ask user about execution mode
  "subcommands"?: Subcommand[], // Nested subcommands (recursive)
  "postExecute"?: string,      // Legacy post-execution command
  "postExecuteCommands"?: string[], // Post-execution commands
  "postExecuteParallel"?: boolean // Run post-execution in parallel
}`}</code>
                            </pre>
                        </div>
                    </div>

                    <div className={styles.dataLocationSection}>
                        <h3>Data Location</h3>
                        <p>
                            Configuration files are stored in the <code>data</code> directory within the CLI tool:
                        </p>
                        <ul>
                            <li><code>CLI/data/*.json</code> - JSON configuration files</li>
                            <li><code>CLI/data/*.yml</code> or <code>CLI/data/*.yaml</code> - YAML configuration files</li>
                        </ul>
                    </div>
                </section>
            )}

            {activeTab === 'options' && (
                <section className={styles.optionsSection}>
                    <h2>Command Options</h2>

                    <div className={styles.optionsIntro}>
                        <p>
                            Options are interactive prompts that collect user input at runtime. They allow your commands
                            to be flexible and customizable based on user preferences and requirements.
                        </p>
                    </div>

                    <div className={styles.optionTypes}>
                        <h3>Option Types</h3>

                        <div className={styles.optionTypeGrid}>
                            <div className={styles.optionCard}>
                                <h4>Input</h4>
                                <p>Free-form text input</p>
                                <pre className={styles.codeBlock}>
                        <code>{`{
  "type": "input",
  "name": "projectName",
  "message": "Enter project name"
}`}</code>
                    </pre>
                            </div>

                            <div className={styles.optionCard}>
                                <h4>List</h4>
                                <p>Selection from predefined choices</p>
                                <pre className={styles.codeBlock}>
                        <code>{`{
  "type": "list",
  "name": "environment",
  "message": "Select environment",
  "choices": ["dev", "stage", "prod"]
}`}</code>
                    </pre>
                            </div>

                            <div className={styles.optionCard}>
                                <h4>Confirm</h4>
                                <p>Yes/No boolean question</p>
                                <pre className={styles.codeBlock}>
                        <code>{`{
  "type": "confirm",
  "name": "skipTests",
  "message": "Skip tests?",
  "default": false
}`}</code>
                    </pre>
                            </div>

                            <div className={styles.optionCard}>
                                <h4>Password</h4>
                                <p>Masked input for sensitive data</p>
                                <pre className={styles.codeBlock}>
                        <code>{`{
  "type": "password",
  "name": "apiKey",
  "message": "Enter API key"
}`}</code>
                    </pre>
                            </div>

                            <div className={styles.optionCard}>
                                <h4>Editor</h4>
                                <p>Multi-line text input in an editor</p>
                                <pre className={styles.codeBlock}>
                        <code>{`{
  "type": "editor",
  "name": "description",
  "message": "Enter detailed description"
}`}</code>
                    </pre>
                            </div>

                            <div className={styles.optionCard}>
                                <h4>Checkbox</h4>
                                <p>Multiple selections from choices</p>
                                <pre className={styles.codeBlock}>
                        <code>{`{
  "type": "checkbox",
  "name": "modules",
  "message": "Select modules to build",
  "choices": ["api", "ui", "db"]
}`}</code>
                    </pre>
                            </div>

                            <div className={styles.optionCard}>
                                <h4>Number</h4>
                                <p>Numeric input with validation</p>
                                <pre className={styles.codeBlock}>
                        <code>{`{
  "type": "number",
  "name": "port",
  "message": "Enter port number",
  "default": 3000
}`}</code>
                    </pre>
                            </div>
                        </div>
                    </div>

                    <div className={styles.optionValidation}>
                        <h3>Input Validation</h3>
                        <p>
                            You can add validation to ensure users provide appropriate input. Validation is defined as a JavaScript
                            function that returns true for valid input or an error message string for invalid input.
                        </p>

                        <div className={styles.validationExamples}>
                            <h4>Validation Examples</h4>
                            <pre className={styles.codeBlock}>
                    <code>{`// Required field validation
{
  "type": "input",
  "name": "projectName",
  "message": "Enter project name",
  "validate": "input => input.trim() !== '' || 'Project name is required'"
}

// Numeric range validation
{
  "type": "number",
  "name": "port",
  "message": "Enter port number (1024-65535)",
  "validate": "input => (input >= 1024 && input <= 65535) || 'Port must be between 1024 and 65535'"
}

// Pattern validation
{
  "type": "input",
  "name": "email",
  "message": "Enter email address",
  "validate": "input => /^[^@]+@[^@]+\\.[^@]+$/.test(input) || 'Please enter a valid email'"
}

// Custom validation logic
{
  "type": "input",
  "name": "gitBranch",
  "message": "Enter git branch name",
  "validate": "input => !input.includes(' ') || 'Branch name cannot contain spaces'"
}`}</code>
                </pre>
                        </div>
                    </div>

                    <div className={styles.optionDefaults}>
                        <h3>Default Values</h3>
                        <p>
                            Default values provide a starting point for user input. They make the command interface more user-friendly
                            by suggesting common values.
                        </p>

                        <div className={styles.defaultExamples}>
                <pre className={styles.codeBlock}>
                    <code>{`// String default
{
  "type": "input",
  "name": "region",
  "message": "Enter AWS region",
  "default": "us-west-2"
}

// Boolean default
{
  "type": "confirm",
  "name": "useTypeScript",
  "message": "Use TypeScript?",
  "default": true
}

// Numeric default
{
  "type": "number",
  "name": "timeout",
  "message": "Enter timeout in seconds",
  "default": 30
}`}</code>
                </pre>
                        </div>
                    </div>

                    <div className={styles.optionUsage}>
                        <h3>Using Option Values</h3>
                        <p>
                            After collecting option values, you can use them in your commands using Handlebars template syntax.
                        </p>

                        <div className={styles.usageExamples}>
                            <h4>Basic Usage</h4>
                            <pre className={styles.codeBlock}>
                    <code>{`{
  "options": [
    {
      "type": "input",
      "name": "projectName",
      "message": "Enter project name"
    }
  ],
  "executeCommands": [
    "mkdir {{projectName}}",
    "cd {{projectName}} && npm init -y"
  ]
}`}</code>
                </pre>

                            <h4>Conditional Usage</h4>
                            <pre className={styles.codeBlock}>
                    <code>{`{
  "options": [
    {
      "type": "confirm",
      "name": "useTypeScript",
      "message": "Use TypeScript?",
      "default": true
    }
  ],
  "executeCommands": [
    "npm init -y",
    "{{#if useTypeScript}}npm install typescript --save-dev{{else}}echo \"Using JavaScript\"{{/if}}",
    "{{#if useTypeScript}}npx tsc --init{{/if}}"
  ]
}`}</code>
                </pre>

                            <h4>Looping Example (Checkbox)</h4>
                            <pre className={styles.codeBlock}>
                    <code>{`{
  "options": [
    {
      "type": "checkbox",
      "name": "packages",
      "message": "Select packages to install",
      "choices": ["react", "express", "mongodb", "redux"]
    }
  ],
  "executeCommands": [
    "npm init -y",
    "{{#each packages}}npm install {{this}}{{/each}}"
  ]
}`}</code>
                </pre>
                        </div>
                    </div>

                    <div className={styles.variableScoping}>
                        <h3>Variable Scope and Access</h3>
                        <p>
                            Variables defined through options are accessible at their level and all child subcommands.
                            This creates a hierarchical inheritance pattern.
                        </p>

                        <div className={styles.scopeExample}>
                <pre className={styles.codeBlock}>
                    <code>{`{
  "commands": [
    {
      "name": "deploy",
      "options": [
        {
          "type": "list",
          "name": "environment",
          "message": "Select environment",
          "choices": ["dev", "staging", "production"]
        }
      ],
      "executeCommands": [
        "echo Preparing deployment for {{environment}}"
      ],
      "subcommands": [
        {
          "name": "api",
          "options": [
            {
              "type": "input",
              "name": "apiVersion",
              "message": "API version to deploy"
            }
          ],
          "executeCommands": [
            "echo Deploying API version {{apiVersion}} to {{environment}}"
            // Can access parent 'environment' variable
          ]
        }
      ]
    }
  ]
}`}</code>
                </pre>
                            <p className={styles.scopeNote}>
                                In this example, the <code>apiVersion</code> option is only available within the "api" subcommand,
                                but the <code>environment</code> option from the parent "deploy" command is available everywhere.
                            </p>
                        </div>
                    </div>

                    <div className={styles.bestPractices}>
                        <h3>Option Best Practices</h3>
                        <ul className={styles.practicesList}>
                            <li>
                                <strong>Use descriptive names:</strong> Choose option names that clearly indicate their purpose
                            </li>
                            <li>
                                <strong>Add clear messages:</strong> Write user-friendly prompts that explain what input is needed
                            </li>
                            <li>
                                <strong>Provide sensible defaults:</strong> Make common choices easy by setting appropriate defaults
                            </li>
                            <li>
                                <strong>Add validation:</strong> Prevent errors by validating user input before command execution
                            </li>
                            <li>
                                <strong>Be consistent:</strong> Use similar option patterns across related commands
                            </li>
                            <li>
                                <strong>Group related options:</strong> Keep related options together at the same command level
                            </li>
                            <li>
                                <strong>Use appropriate types:</strong> Choose the most suitable option type for each input
                            </li>
                        </ul>
                    </div>
                </section>
            )}

            {activeTab === 'examples' && (
                <section className={styles.examplesSection}>
                    <h2>Examples</h2>

                    <div className={styles.examplesIntro}>
                        <p>
                            These examples demonstrate common patterns and use cases for the CLI Command Builder.
                            Use them as starting points for your own commands or to understand best practices.
                        </p>
                    </div>

                    <div className={styles.exampleCard}>
                        <h3>Project Scaffolding</h3>
                        <p>
                            Creates a new project structure with customizable options.
                        </p>
                        <pre className={styles.codeBlock}>
                <code>{`{
  "commands": [
    {
      "name": "init",
      "options": [
        {
          "type": "input",
          "name": "projectName",
          "message": "Project name",
          "validate": "input => input.trim() !== '' || 'Project name is required'"
        },
        {
          "type": "list",
          "name": "projectType",
          "message": "Project type",
          "choices": ["react", "node", "express"]
        },
        {
          "type": "confirm",
          "name": "useTypeScript",
          "message": "Use TypeScript?",
          "default": true
        }
      ],
      "executeCommands": [
        "mkdir {{projectName}}",
        "cd {{projectName}} && npm init -y",
        "{{#if useTypeScript}}cd {{projectName}} && npm install typescript @types/node --save-dev{{/if}}",
        "{{#if useTypeScript}}cd {{projectName}} && npx tsc --init{{/if}}",
        "{{#if (eq projectType 'react')}}cd {{projectName}} && npx create-react-app . {{#if useTypeScript}}--template typescript{{/if}}{{/if}}",
        "{{#if (eq projectType 'express')}}cd {{projectName}} && npm install express{{#if useTypeScript}} @types/express{{/if}}{{/if}}",
        "echo Project {{projectName}} created successfully!"
      ]
    }
  ]
}`}</code>
            </pre>
                    </div>

                    <div className={styles.exampleCard}>
                        <h3>Multi-Environment Deployment</h3>
                        <p>
                            Handles deployment across different environments with environment-specific configurations.
                        </p>
                        <pre className={styles.codeBlock}>
                <code>{`{
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
          "name": "runTests",
          "message": "Run tests before deployment?",
          "default": true
        }
      ],
      "executeCommands": [
        "echo Preparing for {{environment}} deployment",
        "{{#if runTests}}npm test{{/if}}"
      ],
      "subcommands": [
        {
          "name": "frontend",
          "executeCommands": [
            "npm run build -- --env={{environment}}",
            "{{#if (eq environment 'production')}}npm run optimize{{/if}}",
            "aws s3 sync ./build s3://my-app-{{environment}}"
          ]
        },
        {
          "name": "backend",
          "options": [
            {
              "type": "confirm",
              "name": "migrateDb",
              "message": "Run database migrations?",
              "default": true
            }
          ],
          "executeCommands": [
            "{{#if migrateDb}}npm run migrate:{{environment}}{{/if}}",
            "zip -r backend.zip .",
            "aws lambda update-function-code --function-name my-app-{{environment}} --zip-file fileb://backend.zip"
          ]
        }
      ]
    }
  ]
}`}</code>
            </pre>
                    </div>

                    <div className={styles.exampleCard}>
                        <h3>Database Operations</h3>
                        <p>
                            Manages database backup, restore, and migration operations with safeguards.
                        </p>
                        <pre className={styles.codeBlock}>
                <code>{`{
  "commands": [
    {
      "name": "db",
      "subcommands": [
        {
          "name": "backup",
          "options": [
            {
              "type": "list",
              "name": "dbEnvironment",
              "message": "Database environment",
              "choices": ["local", "dev", "prod"]
            },
            {
              "type": "input",
              "name": "outputFile",
              "message": "Backup filename",
              "default": "backup-{{dbEnvironment}}-{{timestamp}}.sql"
            }
          ],
          "executeCommands": [
            "echo Backing up {{dbEnvironment}} database to {{outputFile}}",
            "{{#if (eq dbEnvironment 'prod')}}echo \"⚠️ PRODUCTION BACKUP\" && sleep 3{{/if}}",
            "pg_dump -U postgres -h {{dbEnvironment}}-db.example.com -d myapp > {{outputFile}}"
            ]
        },
        {
          "name": "restore",
          "options": [
            {
              "type": "list",
              "name": "targetEnv",
              "message": "Restore to environment",
              "choices": ["local", "dev"]
            },
            {
              "type": "input",
              "name": "backupFile",
              "message": "Backup file to restore",
              "validate": "input => input.trim() !== '' || 'Backup file is required'"
            },
            {
              "type": "confirm",
              "name": "dropFirst",
              "message": "Drop database before restore?",
              "default": false
            }
          ],
          "executeCommands": [
            "echo Restoring {{backupFile}} to {{targetEnv}} environment",
            "{{#if dropFirst}}psql -U postgres -h {{targetEnv}}-db.example.com -c 'DROP DATABASE IF EXISTS myapp; CREATE DATABASE myapp;'{{/if}}",
            "psql -U postgres -h {{targetEnv}}-db.example.com -d myapp < {{backupFile}}",
            "echo Database restored successfully"
          ]
        },
        {
          "name": "migrate",
          "options": [
            {
              "type": "list",
              "name": "migrateEnv",
              "message": "Environment to migrate",
              "choices": ["local", "dev", "staging", "prod"]
            },
            {
              "type": "confirm",
              "name": "createBackup",
              "message": "Create backup before migration?",
              "default": true
            }
          ],
          "executeCommands": [
            "echo Preparing to migrate {{migrateEnv}} database",
            "{{#if (eq migrateEnv 'prod')}}echo \"⚠️ PRODUCTION MIGRATION\" && sleep 5{{/if}}",
            "{{#if createBackup}}npm run db:backup -- --env={{migrateEnv}} --auto-filename{{/if}}",
            "npx prisma migrate deploy --schema=./prisma/{{migrateEnv}}.prisma"
          ]
        }
      ]
    }
  ]
}`}</code>
            </pre>
                    </div>

                    <div className={styles.exampleCard}>
                        <h3>GitOps Workflow</h3>
                        <p>
                            Automates Git operations with branch management and deployment triggers.
                        </p>
                        <pre className={styles.codeBlock}>
                <code>{`{
  "commands": [
    {
      "name": "git",
      "subcommands": [
        {
          "name": "feature",
          "options": [
            {
              "type": "input",
              "name": "featureName",
              "message": "Feature name",
              "validate": "input => /^[a-z0-9-_]+$/.test(input) || 'Use only lowercase letters, numbers, hyphens and underscores'"
            }
          ],
          "executeCommands": [
            "git checkout main",
            "git pull",
            "git checkout -b feature/{{featureName}}"
          ]
        },
        {
          "name": "publish",
          "options": [
            {
              "type": "confirm",
              "name": "runTests",
              "message": "Run tests before publishing?",
              "default": true
            },
            {
              "type": "input",
              "name": "commitMsg",
              "message": "Commit message",
              "default": "Updates from {{currentBranch}}"
            }
          ],
          "executeCommands": [
            "echo Current branch: $(git branch --show-current)",
            "{{#if runTests}}npm test{{/if}}",
            "git add .",
            "git commit -m \"{{commitMsg}}\"",
            "git push origin $(git branch --show-current)"
          ]
        },
        {
          "name": "release",
          "options": [
            {
              "type": "list",
              "name": "releaseType",
              "message": "Release type",
              "choices": ["patch", "minor", "major"]
            },
            {
              "type": "confirm",
              "name": "createTag",
              "message": "Create Git tag?",
              "default": true
            }
          ],
          "executeCommands": [
            "git checkout main",
            "git pull",
            "npm version {{releaseType}}",
            "{{#if createTag}}git push --follow-tags{{else}}git push{{/if}}",
            "echo Released version $(node -p \"require('./package.json').version\")"
          ]
        }
      ]
    }
  ]
}`}</code>
            </pre>
                    </div>

                    <div className={styles.exampleCard}>
                        <h3>Container Management</h3>
                        <p>
                            Commands for Docker and Kubernetes operations across environments.
                        </p>
                        <pre className={styles.codeBlock}>
                <code>{`{
  "commands": [
    {
      "name": "container",
      "subcommands": [
        {
          "name": "build",
          "options": [
            {
              "type": "input",
              "name": "serviceName",
              "message": "Service name",
              "default": "api"
            },
            {
              "type": "input",
              "name": "tag",
              "message": "Image tag",
              "default": "latest"
            },
            {
              "type": "checkbox",
              "name": "buildArgs",
              "message": "Build arguments",
              "choices": ["no-cache", "pull"]
            }
          ],
          "executeCommands": [
            "echo Building {{serviceName}} with tag {{tag}}",
            "docker build {{#each buildArgs}}--{{this}} {{/each}}-t {{serviceName}}:{{tag}} -f ./docker/{{serviceName}}/Dockerfile ."
          ]
        },
        {
          "name": "deploy",
          "options": [
            {
              "type": "list",
              "name": "k8sEnv",
              "message": "Kubernetes environment",
              "choices": ["dev", "staging", "prod"]
            },
            {
              "type": "input",
              "name": "namespace",
              "message": "Namespace",
              "default": "default"
            }
          ],
          "executeCommands": [
            "echo Deploying to {{k8sEnv}} environment in namespace {{namespace}}",
            "kubectl config use-context {{k8sEnv}}-cluster",
            "kubectl apply -f ./kubernetes/{{k8sEnv}}/deployment.yaml -n {{namespace}}",
            "kubectl rollout status deployment/app-deployment -n {{namespace}}"
          ]
        }
      ]
    }
  ]
}`}</code>
            </pre>
                    </div>

                    <div className={styles.modifyingExamples}>
                        <h3>Customizing Examples</h3>
                        <p>
                            To use these examples as starting points:
                        </p>
                        <ol>
                            <li>Copy the example that most closely matches your needs</li>
                            <li>Click the "Edit JSON" button in the UI to paste the example</li>
                            <li>Modify the commands, options, and structure to fit your specific requirements</li>
                            <li>Test your configuration with small command changes before making large modifications</li>
                            <li>Save your customized version with a descriptive name</li>
                        </ol>
                        <p>
                            Remember that these examples demonstrate concepts and patterns - you'll likely need to adjust paths,
                            command arguments, and options to work with your specific project structure.
                        </p>
                    </div>
                </section>
            )}
        </div>
    );
}

export default Documentation;
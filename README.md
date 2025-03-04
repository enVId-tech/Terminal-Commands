Welcome to the Terminal Commands Program
=========================================
This CLI tool automates command execution through a flexible configuration system. It allows you to:

- Define command workflows in JSON/YAML configuration files
- Create hierarchical command structures with subcommands
- Execute commands sequentially or in parallel
- Prompt users for inputs with validation
- Transform user input into command parameters
- Chain commands with post-execution tasks
- Dynamically select commands based on user choices

The program offers:  
- Interactive menu-based command selection
- Multiple configuration file support
- Custom validation functions for user input
- Templated command strings that incorporate user responses
- Parallel or sequential command execution with user confirmation
- Comprehensive error handling and command output display
- Perfect for creating custom dev workflows, automating repetitive tasks, or building
--------------
Tutorial
===================
This tutorial will guide you through the process of creating a simple command workflow using the Terminal Commands Program.

Step 1: Install the Program
----------------------------
To install the program, first go to the CLI folder on this GitHub and download the `main.ts` folder

Place the `main.ts` file in a directory of your choice. As well, download the `package.json` file and the `tsconfig.json` file in the root directory and place them in the same directory as the `main.ts` file.

Open a terminal window in that directory and run the following command to install the necessary dependencies:

```bash
npm install
```

NOTE: Make sure you have LATEST Node.js installed on your machine before running the above command. If you don't have Node.js installed, you can download it from the official website: https://nodejs.org/

Step 2: Configuration file creation
-----------------------------------
Inside of main.ts, make sure to change the ``dataDirPath`` variable to the path of the configuration file you want to use (..data is the default).

Go to the website https://commands.etran.dev/ and create a configuration file.

Hint: It is recommended to read the documentation on the website beforehand AND use the YAML format for the configuration file.

-----
After you create the configuration file, download it using the `Export Configuration` button and place it in the same directory as the 'main.ts' file.

Step 3: Run the Program
-----------------------

To run the program, open a terminal window in the directory where the `main.ts` file is located and run the following command:

```bash
node ./main.ts
```

The program will start, and you will see the interactive menu with the command you created. Select the command, and follow the prompts to see the output.

Congratulations! You have successfully created and executed a simple command workflow using the Terminal Commands Program. You can now explore more advanced features and create complex workflows to automate your tasks.

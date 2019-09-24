# Contributing to vscode-namegen

The most straightforward contributions to this project fall into two categories: Adding a casing option, and adding a wordlist. Otherwise, please take a look at the open issues and see what you'd like to tackle!

## Adding a casing option

In vscode-namegen, casing options require a couple changes. Each casing option has it's own VS Code command, as well as a case in the `getWord()` function in `extension.ts`. The enum which defines which casing option a user prefers to choose by default when using the `shift + alt + j` keyboard shortcut also needs to be updated.

## Adding a wordlist

Adding a wordlist is probably the most accessible contribution for newcomers to this project, and newcomers to VS Code extensions in general. Add a wordlist with one entry per line, all lower case, no special characters into the `src/wordlists` folder. The file must end in `.txt`. Then in the enum in `package.json` which defines which wordlist the user prefers as default, add the exact filename without extension.

## Building and testing

In the root of the project, there is a `build.ps1` file which can be used to build the extension. After building, in VS Code, press F5 and a development testing VS Code window will open with the extension running. Using the `-Package` switch will generate a `.vsix` file that you can add to VS Code.

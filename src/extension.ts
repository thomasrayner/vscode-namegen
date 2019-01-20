// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
		console.log('Congratulations, your extension "vscode-namegen" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.insertName', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const randomWord = require('random-word');
			const words = [randomWord(), randomWord()];
			const newName = words[0] + words[1].charAt(0).toUpperCase() + words[1].substr(1);

			editor.edit(edit => {
				edit.insert(editor.selection.start, newName);
			});

			console.log("Inserted " + newName);
		}
		console.log("No active editor, didn't stick anything in");		
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

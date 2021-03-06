import * as vscode from 'vscode';
import fs = require('fs');


function getWord(WordFormat: string, Editor: vscode.TextEditor) {
	const uniqueRandomArray = require('unique-random-array');
	const path = require('path');
	let newName: string = "";
	const wordCount = vscode.workspace.getConfiguration('randomNameGen').WordCount;
	const theme = vscode.workspace.getConfiguration('randomNameGen').DefaultTheme;
	const wordListPath = path.join(__dirname, `wordlists/${theme}.txt`);

	console.log("WordFormat: " + WordFormat + ". WordCount: " + wordCount + ". Theme: " + theme);

	for (let index = 0; index < wordCount; index++) {
		const wordRetrieve = uniqueRandomArray(fs.readFileSync(wordListPath, 'utf8').split('\n'));
		const word = wordRetrieve().replace(/[^a-zA-Z]/g, "").toLowerCase();

		switch (WordFormat) {
			case 'camelCase': {
				if (index === 0) {
					newName += word;
				}
				else {
					newName += word.charAt(0).toUpperCase() + word.substr(1);
				}
				break;
			}

			case 'PascalCase': {
				newName += word.charAt(0).toUpperCase() + word.substr(1);
				break;
			}

			case 'snake_case': {
				if (index === 0) {
					newName += word;
				}
				else {
					newName += "_" + word;
				}
				break;
			}

			case 'kebab-case': {
				if (index === 0) {
					newName += word;
				}
				else {
					newName += "-" + word;
				}
				break;
			}

			case 'Train-Case': {
				if (index === 0) {
					newName +=  word.charAt(0).toUpperCase() + word.substr(1);
				}
				else {
					newName += "-" + word.charAt(0).toUpperCase() + word.substr(1);
				}
				break;
			}

			case 'crAZyModE': {
				newName += (word).split('').map(function (c: string){
					const chance = Math.round(Math.random());
					return c = chance ? c.toUpperCase() : c.toLowerCase();
				}).join('');
				break;
			}
			default: {
				newName = "random";
			}
		}
	}

	Editor.edit(edit => {
		edit.insert(Editor.selection.start, newName);
	});
	console.log("Inserted " + newName);
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "vscode-namegen" is now active.');

	// The command has been defined in the package.json file
	let disposableCamel = vscode.commands.registerCommand('extension.insertCamel', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			getWord('camelCase', editor);
		}
		else {
			console.log("No active editor, didn't stick anything in");
		}
	});
	context.subscriptions.push(disposableCamel);

	let disposablePascal = vscode.commands.registerCommand('extension.insertPascal', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			getWord('PascalCase', editor);
		}
		else {
			console.log("No active editor, didn't stick anything in");
		}
	});
	context.subscriptions.push(disposablePascal);

	let disposableSnake = vscode.commands.registerCommand('extension.insertSnake', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			getWord('snake_case', editor);
		}
		else {
			console.log("No active editor, didn't stick anything in");
		}
	});
	context.subscriptions.push(disposableSnake);

	let disposableKebab = vscode.commands.registerCommand('extension.insertKebab', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			getWord('kebab-case', editor);
		}
		else {
			console.log("No active editor, didn't stick anything in");
		}
	});
	context.subscriptions.push(disposableKebab);

	let disposableTrain = vscode.commands.registerCommand('extension.insertTrain', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			getWord('Train-Case', editor);
		}
		else {
			console.log("No active editor, didn't stick anything in");
		}
	});
	context.subscriptions.push(disposableTrain);

	let disposableCrazy = vscode.commands.registerCommand('extension.insertCrazy', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			getWord('crAZyModE', editor);
		}
		else {
			console.log("No active editor, didn't stick anything in");
		}
	});
	context.subscriptions.push(disposableCrazy);

	let disposableDefault = vscode.commands.registerCommand('extension.insertDefault', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const casing = vscode.workspace.getConfiguration('randomNameGen').DefaultCasing;
			getWord(casing, editor);
		}
		else {
			console.log("No active editor, didn't stick anything in");
		}
	});
	context.subscriptions.push(disposableDefault);
}

// this method is called when your extension is deactivated
export function deactivate() {}

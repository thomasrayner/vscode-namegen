"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function getWord(WordFormat, Editor) {
    const randomWord = require('random-word');
    const words = [randomWord(), randomWord()];
    let newName = "";
    console.log("WordFormat: " + WordFormat);
    switch (WordFormat) {
        case 'camelCase': {
            newName = words[0] + words[1].charAt(0).toUpperCase() + words[1].substr(1);
            break;
        }
        case 'PascalCase': {
            newName = words[0].charAt(0).toUpperCase() + words[0].substr(1) +
                words[1].charAt(0).toUpperCase() + words[1].substr(1);
            break;
        }
        case 'snake_case': {
            newName = words[0] + "_" + words[1];
            break;
        }
        case 'Kebab-Case': {
            newName = words[0].charAt(0).toUpperCase() + words[0].substr(1) +
                '-' + words[1].charAt(0).toUpperCase() + words[1].substr(1);
            break;
        }
        case 'crAZyModE': {
            newName = (words[0] + words[1]).split('').map(function (c) {
                const chance = Math.round(Math.random());
                return c = chance ? c.toUpperCase() : c.toLowerCase();
            }).join('');
            break;
        }
        default: {
            newName = "random";
        }
    }
    Editor.edit(edit => {
        edit.insert(Editor.selection.start, newName);
    });
    console.log("Inserted " + newName);
}
function activate(context) {
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
            getWord('Kebab-Case', editor);
        }
        else {
            console.log("No active editor, didn't stick anything in");
        }
    });
    context.subscriptions.push(disposableKebab);
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
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
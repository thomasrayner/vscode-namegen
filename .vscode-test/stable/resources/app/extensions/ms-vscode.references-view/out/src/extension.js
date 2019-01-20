"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const history_1 = require("./history");
const model_1 = require("./model");
const provider_1 = require("./provider");
const editorHighlights_1 = require("./editorHighlights");
function activate(context) {
    const viewId = 'references-view.tree';
    const history = new history_1.History();
    const provider = new provider_1.DataProvider();
    const view = vscode.window.createTreeView(viewId, {
        treeDataProvider: provider,
        showCollapseAll: true
    });
    // editor highlights
    const editorHighlights = new editorHighlights_1.EditorHighlights();
    vscode.window.onDidChangeActiveTextEditor(() => view.visible && editorHighlights.show(), context.subscriptions);
    view.onDidChangeVisibility(e => e.visible ? editorHighlights.show() : editorHighlights.hide(), context.subscriptions);
    // current active model
    let model;
    const showNoResult = () => {
        let message;
        if (history.isEmpty) {
            message = new vscode.MarkdownString('No results found.');
        }
        else {
            message = new vscode.MarkdownString();
            message.value = `No results found, run a previous search again:\n${history.summary}`;
            message.isTrusted = true;
        }
        view.message = message;
    };
    const findCommand = (uri, position) => __awaiter(this, void 0, void 0, function* () {
        // upon first interaction set the reference list as active and reveal it
        yield vscode.commands.executeCommand('setContext', 'reference-list.isActive', true);
        vscode.commands.executeCommand(`${viewId}.focus`);
        // remove existing highlights
        editorHighlights.setModel(undefined);
        view.message = undefined;
        let modelCreation;
        if (uri instanceof vscode.Uri && position instanceof vscode.Position) {
            // trust args if correct'ish
            modelCreation = model_1.Model.create(uri, position);
        }
        else if (vscode.window.activeTextEditor) {
            let editor = vscode.window.activeTextEditor;
            if (editor.document.getWordRangeAtPosition(editor.selection.active)) {
                modelCreation = model_1.Model.create(editor.document.uri, editor.selection.active);
            }
        }
        // the model creation promise is passed to the provider so that the 
        // tree view can indicate loading, for everthing else we need to wait
        // for the model to be resolved
        provider.setModelCreation(modelCreation);
        if (!modelCreation) {
            return showNoResult();
        }
        // wait for model, update context and UI
        model = yield modelCreation;
        vscode.commands.executeCommand('setContext', 'reference-list.hasResult', Boolean(model));
        if (!model || model.items.length === 0) {
            return showNoResult();
        }
        // update history
        history.add(model);
        // update editor
        editorHighlights.setModel(model);
        // udate tree
        const selection = model.first();
        if (selection) {
            view.reveal(selection, { select: true, focus: true });
        }
        // update message
        if (model.total === 1 && model.items.length === 1) {
            view.message = new vscode.MarkdownString(`${model.total} result in ${model.items.length} file`);
        }
        else if (model.total === 1) {
            view.message = new vscode.MarkdownString(`${model.total} result in ${model.items.length} files`);
        }
        else if (model.items.length === 1) {
            view.message = new vscode.MarkdownString(`${model.total} results in ${model.items.length} file`);
        }
        else {
            view.message = new vscode.MarkdownString(`${model.total} results in ${model.items.length} files`);
        }
    });
    const refindCommand = (id) => {
        if (typeof id !== 'string') {
            return;
        }
        let item = history.get(id);
        if (item) {
            return findCommand(item.uri, item.position);
        }
    };
    const refreshCommand = () => __awaiter(this, void 0, void 0, function* () {
        if (model) {
            return findCommand(model.uri, model.position);
        }
    });
    const clearCommand = () => __awaiter(this, void 0, void 0, function* () {
        vscode.commands.executeCommand('setContext', 'reference-list.hasResult', false);
        editorHighlights.setModel(undefined);
        provider.setModelCreation(undefined);
        let lis = provider.onDidReturnEmpty(() => {
            lis.dispose();
            let message = new vscode.MarkdownString();
            message.value = `To populate this view, open an editor and run the 'Find All References'-command or run a previous search again:\n${history.summary}`;
            message.isTrusted = true;
            view.message = message;
        });
    });
    const showRefCommand = (arg, focusEditor) => {
        if (arg instanceof model_1.ReferenceItem) {
            const { location } = arg;
            vscode.window.showTextDocument(location.uri, {
                selection: location.range.with({ end: location.range.start }),
                preserveFocus: !focusEditor
            });
        }
    };
    const removeRefCommand = (arg) => {
        if (model) {
            const next = model.move(arg, true);
            model.remove(arg);
            editorHighlights.refresh();
            if (next) {
                view.reveal(next, { select: true });
            }
        }
    };
    const focusRefCommand = (fwd) => {
        if (!model) {
            return;
        }
        const selection = view.selection[0] || model.first();
        const next = model.move(selection, fwd);
        if (next) {
            view.reveal(next, { select: true });
            showRefCommand(next, true);
        }
    };
    const copyCommand = (arg) => __awaiter(this, void 0, void 0, function* () {
        let val = '';
        let stack = [arg];
        while (stack.length > 0) {
            let item = stack.pop();
            if (item instanceof model_1.Model) {
                stack.push(...item.items.slice(0, 99));
            }
            else if (item instanceof model_1.ReferenceItem) {
                let doc = yield item.parent.getDocument();
                let chunks = provider_1.getPreviewChunks(doc, item.location.range, 21, false);
                val += `  ${item.location.range.start.line + 1},${item.location.range.start.character + 1}:${chunks.before + chunks.inside + chunks.after}\n`;
            }
            else if (item instanceof model_1.FileItem) {
                val += `${vscode.workspace.asRelativePath(item.uri)}\n`;
                stack.push(...item.results);
            }
        }
        if (val) {
            yield vscode.env.clipboard.writeText(val);
        }
    });
    const copyPathCommand = (arg) => {
        if (arg instanceof model_1.FileItem) {
            if (arg.uri.scheme === 'file') {
                vscode.env.clipboard.writeText(arg.uri.fsPath);
            }
            else {
                vscode.env.clipboard.writeText(arg.uri.toString(true));
            }
        }
    };
    context.subscriptions.push(view, vscode.commands.registerCommand('references-view.find', findCommand), vscode.commands.registerCommand('references-view.refind', refindCommand), vscode.commands.registerCommand('references-view.refresh', refreshCommand), vscode.commands.registerCommand('references-view.clear', clearCommand), vscode.commands.registerCommand('references-view.show', showRefCommand), vscode.commands.registerCommand('references-view.remove', removeRefCommand), vscode.commands.registerCommand('references-view.next', () => focusRefCommand(true)), vscode.commands.registerCommand('references-view.prev', () => focusRefCommand(false)), vscode.commands.registerCommand('references-view.copy', copyCommand), vscode.commands.registerCommand('references-view.copyAll', () => copyCommand(model)), vscode.commands.registerCommand('references-view.copyPath', copyPathCommand));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map
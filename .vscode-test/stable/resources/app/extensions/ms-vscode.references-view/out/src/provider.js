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
const model_1 = require("./model");
function getPreviewChunks(doc, range, beforeLen = 8, trim = true) {
    let previewStart = range.start.with({ character: Math.max(0, range.start.character - beforeLen) });
    let wordRange = doc.getWordRangeAtPosition(previewStart);
    let before = doc.getText(new vscode.Range(wordRange ? wordRange.start : previewStart, range.start));
    let inside = doc.getText(range);
    let previewEnd = range.end.translate(0, 331);
    let after = doc.getText(new vscode.Range(range.end, previewEnd));
    if (trim) {
        before = before.replace(/^\s*/g, '');
        after = after.replace(/\s*$/g, '');
    }
    return { before, inside, after };
}
exports.getPreviewChunks = getPreviewChunks;
class DataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this._onDidReturnEmpty = new vscode.EventEmitter();
        this.onDidReturnEmpty = this._onDidReturnEmpty.event;
    }
    setModelCreation(modelCreation) {
        if (this._modelListener) {
            this._modelListener.dispose();
        }
        this._modelCreation = modelCreation;
        this._onDidChangeTreeData.fire();
        if (modelCreation) {
            modelCreation.then(model => {
                if (model && modelCreation === this._modelCreation) {
                    this._modelListener = model.onDidChange(e => this._onDidChangeTreeData.fire(e instanceof model_1.FileItem ? e : undefined));
                }
            });
        }
    }
    getTreeItem(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (element instanceof model_1.FileItem) {
                // files
                const result = new vscode.TreeItem(element.uri);
                result.contextValue = 'file-item';
                result.description = true;
                result.iconPath = vscode.ThemeIcon.File;
                result.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
                return result;
            }
            if (element instanceof model_1.ReferenceItem) {
                // references
                const { range } = element.location;
                const doc = yield element.parent.getDocument(true);
                const { before, inside, after } = getPreviewChunks(doc, range);
                const label = {
                    label: before + inside + after,
                    highlights: [[before.length, before.length + inside.length]]
                };
                const result = new vscode.TreeItem2(label);
                result.collapsibleState = vscode.TreeItemCollapsibleState.None;
                result.contextValue = 'reference-item';
                result.command = {
                    title: 'Open Reference',
                    command: 'references-view.show',
                    arguments: [element]
                };
                return result;
            }
            throw new Error();
        });
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._modelCreation) {
                this._onDidReturnEmpty.fire(this);
            }
            if (element instanceof model_1.FileItem) {
                return element.results;
            }
            else if (this._modelCreation) {
                const model = yield this._modelCreation;
                return model ? model.items : [];
            }
            else {
                return [];
            }
        });
    }
    getParent(element) {
        return element instanceof model_1.ReferenceItem
            ? element.parent
            : undefined;
    }
}
exports.DataProvider = DataProvider;
//# sourceMappingURL=provider.js.map
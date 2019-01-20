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
const provider_1 = require("./provider");
class History {
    constructor() {
        this._items = new Map();
    }
    get summary() {
        let val = '';
        for (const item of this) {
            val += `* ${item.preview}\n`;
        }
        return val;
    }
    get isEmpty() {
        return this._items.size == 0;
    }
    *[Symbol.iterator]() {
        let values = [...this._items.values()];
        for (let i = values.length - 1; i >= 0; i--) {
            yield values[i];
        }
    }
    add({ uri, position }) {
        return __awaiter(this, void 0, void 0, function* () {
            let doc;
            try {
                doc = yield vscode.workspace.openTextDocument(uri);
            }
            catch (e) {
                return;
            }
            const range = doc.getWordRangeAtPosition(position);
            if (!range) {
                return;
            }
            const id = History._makeId(uri, range.start);
            // make preview
            let { before, inside, after } = provider_1.getPreviewChunks(doc, range);
            // ensure whitespace isn't trimmed when rendering MD
            before = before.replace(/s$/g, String.fromCharCode(160));
            after = after.replace(/^s/g, String.fromCharCode(160));
            // make command link
            let query = encodeURIComponent(JSON.stringify([id]));
            let title = `${vscode.workspace.asRelativePath(uri)}:${position.line + 1}:${position.character + 1}`;
            inside = `[${inside}](command:references-view.refind?${query} "${title}")`;
            const preview = before + inside + after;
            // maps have filo-ordering and by delete-insert we make
            // sure to update the order for re-run queries
            this._items.delete(id);
            this._items.set(id, { id, preview, uri, position });
        });
    }
    get(id) {
        return this._items.get(id);
    }
    static _makeId(uri, position) {
        return Buffer.from(uri.toString() + position.line + position.character).toString('base64');
    }
}
exports.History = History;
//# sourceMappingURL=history.js.map
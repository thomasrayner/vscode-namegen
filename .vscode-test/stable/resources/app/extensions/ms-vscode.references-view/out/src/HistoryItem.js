"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extension_1 = require("./extension");
class History {
    constructor() {
        this._items = new Map();
    }
    *[Symbol.iterator]() {
        let values = [...this._items.values()];
        for (let i = values.length - 1; i >= 0; i--) {
            yield values[i];
        }
    }
    add({ uri, position }) {
        const id = History._makeId(uri, position);
        const preview = vscode.workspace.openTextDocument(uri).then(doc => {
            let range = doc.getWordRangeAtPosition(position);
            if (range) {
                let { before, inside, after } = extension_1.getPreviewChunks(doc, range);
                // ensure whitespace isn't trimmed when rendering MD
                before = before.replace(/s$/g, String.fromCharCode(160));
                after = after.replace(/^s/g, String.fromCharCode(160));
                // make command link
                let query = encodeURIComponent(JSON.stringify([id]));
                let title = `${vscode.workspace.asRelativePath(uri)}:${position.line + 1}:${position.character + 1}`;
                inside = `[${inside}](command:references-view.refind?${query} "${title}")`;
                return before + inside + after;
            }
        });
        // maps have filo-ordering and by delete-insert we make
        // sure to update the order for re-run queries
        this._items.delete(id);
        this._items.set(id, { id, preview, uri, position });
    }
    get(id) {
        return this._items.get(id);
    }
    static _makeId(uri, position) {
        return Buffer.from(uri.toString() + position.line + position.character).toString('base64');
    }
}
exports.History = History;
//# sourceMappingURL=HistoryItem.js.map
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
class FileItem {
    constructor(uri, results, parent) {
        this.uri = uri;
        this.results = results;
        this.parent = parent;
    }
    getDocument(warmUpNext) {
        if (!this._document) {
            this._document = vscode.workspace.openTextDocument(this.uri);
        }
        if (warmUpNext) {
            // load next document once this document has been loaded
            // and when next document has not yet been loaded
            const item = this.parent.move(this, true);
            if (item && !item.parent._document) {
                this._document.then(() => item.parent.getDocument(false));
            }
        }
        return this._document;
    }
}
exports.FileItem = FileItem;
class ReferenceItem {
    constructor(location, parent) {
        this.location = location;
        this.parent = parent;
    }
}
exports.ReferenceItem = ReferenceItem;
class Model {
    constructor(uri, position, locations) {
        this.uri = uri;
        this.position = position;
        this._onDidChange = new vscode.EventEmitter();
        this.onDidChange = this._onDidChange.event;
        this.total = locations.length;
        this.items = [];
        let last;
        locations.sort(Model._compareLocations);
        for (const loc of locations) {
            if (!last || last.uri.toString() !== loc.uri.toString()) {
                last = new FileItem(loc.uri, [], this);
                this.items.push(last);
            }
            last.results.push(new ReferenceItem(loc, last));
        }
    }
    static create(uri, position) {
        return __awaiter(this, void 0, void 0, function* () {
            let locations = yield vscode.commands.executeCommand('vscode.executeReferenceProvider', uri, position);
            if (!locations) {
                return undefined;
            }
            return new Model(uri, position, locations);
        });
    }
    get(uri) {
        for (const item of this.items) {
            if (item.uri.toString() === uri.toString()) {
                return item;
            }
        }
        return undefined;
    }
    first() {
        for (const item of this.items) {
            if (item.uri.toString() === this.uri.toString()) {
                for (const ref of item.results) {
                    if (ref.location.range.contains(this.position)) {
                        return ref;
                    }
                }
                return undefined;
            }
        }
        return undefined;
    }
    remove(item) {
        if (item instanceof FileItem) {
            Model._del(this.items, item);
            this._onDidChange.fire(this);
        }
        else if (item instanceof ReferenceItem) {
            Model._del(item.parent.results, item);
            if (item.parent.results.length === 0) {
                Model._del(this.items, item.parent);
                this._onDidChange.fire(this);
            }
            else {
                this._onDidChange.fire(item.parent);
            }
        }
    }
    move(item, fwd) {
        const delta = fwd ? +1 : -1;
        const _move = (item) => {
            const idx = (this.items.indexOf(item) + delta + this.items.length) % this.items.length;
            return this.items[idx];
        };
        if (item instanceof FileItem) {
            if (fwd) {
                return item.results[0];
            }
            else {
                return Model._tail(_move(item).results);
            }
        }
        if (item instanceof ReferenceItem) {
            const idx = item.parent.results.indexOf(item) + delta;
            if (idx < 0) {
                return Model._tail(_move(item.parent).results);
            }
            else if (idx >= item.parent.results.length) {
                return _move(item.parent).results[0];
            }
            else {
                return item.parent.results[idx];
            }
        }
    }
    static _compareLocations(a, b) {
        if (a.uri.toString() < b.uri.toString()) {
            return -1;
        }
        else if (a.uri.toString() > b.uri.toString()) {
            return 1;
        }
        else if (a.range.start.isBefore(b.range.start)) {
            return -1;
        }
        else if (a.range.start.isAfter(b.range.start)) {
            return 1;
        }
        else {
            return 0;
        }
    }
    static _del(array, e) {
        const idx = array.indexOf(e);
        if (idx >= 0) {
            array.splice(idx, 1);
        }
    }
    static _tail(array) {
        return array[array.length - 1];
    }
}
exports.Model = Model;
//# sourceMappingURL=model.js.map
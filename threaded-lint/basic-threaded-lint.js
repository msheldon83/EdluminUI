"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var os = require("os");
var eslint_1 = require("eslint");
var ts_await_spawn_1 = require("./ts-await-spawn");
var threshold = 1000000;
var subProcessNumber = 3;
function sliceFiles(parent) {
    return __awaiter(this, void 0, void 0, function () {
        var biteSizedChunks, children, childResults;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    biteSizedChunks = [];
                    return [4, fs_1.promises.readdir(parent, { withFileTypes: true })];
                case 1:
                    children = _a.sent();
                    return [4, Promise.all(children.map(function (child) { return __awaiter(_this, void 0, void 0, function () {
                            var childPath, stat, _a, chunks, size, containsTs;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        childPath = parent + "/" + child.name;
                                        return [4, fs_1.promises.stat(childPath)];
                                    case 1:
                                        stat = _b.sent();
                                        if (!child.isFile()) return [3, 2];
                                        if (child.name.endsWith(".gen.ts"))
                                            return [2, [[], 0, false]];
                                        return [2, [".ts", ".tsx"].some(function (suff) { return child.name.endsWith(suff); })
                                                ? [[{ path: childPath, size: stat.size }], stat.size, true]
                                                : [[], 0, false]];
                                    case 2: return [4, sliceFiles(childPath)];
                                    case 3:
                                        _a = __read.apply(void 0, [_b.sent(), 3]), chunks = _a[0], size = _a[1], containsTs = _a[2];
                                        return [2, containsTs
                                                ? [
                                                    size < threshold ? [{ path: childPath, size: size }] : chunks,
                                                    size,
                                                    true,
                                                ]
                                                : [[], 0, false]];
                                }
                            });
                        }); }))];
                case 2:
                    childResults = _a.sent();
                    return [2, childResults.reduce(function (_a, _b) {
                            var _c = __read(_a, 3), accChunks = _c[0], accSize = _c[1], accContains = _c[2];
                            var _d = __read(_b, 3), chunks = _d[0], size = _d[1], containsTs = _d[2];
                            return [
                                accChunks.concat(chunks),
                                accSize + size,
                                accContains || containsTs,
                            ];
                        }, [[], 0, false])];
            }
        });
    });
}
function distributeWork(chunks) {
    var piles = Array(subProcessNumber)
        .fill(0)
        .map(function (n) { return [[], 0]; });
    chunks.sort(function (_a, _b) {
        var size1 = _a.size;
        var size2 = _b.size;
        return size1 - size2;
    });
    while (chunks.length > 0) {
        var _a = chunks.pop(), path = _a.path, size = _a.size;
        piles[0][0].push(path);
        piles[0][1] += size;
        piles.sort(function (_a, _b) {
            var _c = __read(_a, 2), f1 = _c[0], n1 = _c[1];
            var _d = __read(_b, 2), f2 = _d[0], n2 = _d[1];
            return n1 - n2;
        });
    }
    return piles;
}
function divvyUp(root) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, chunks, piles;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4, sliceFiles(root)];
                case 1:
                    _a = __read.apply(void 0, [_b.sent(), 2]), chunks = _a[0];
                    piles = distributeWork(chunks);
                    console.log(piles.map(function (_a) {
                        var _b = __read(_a, 2), files = _b[0], size = _b[1];
                        return files;
                    }));
                    return [2, piles.map(function (_a) {
                            var _b = __read(_a, 2), files = _b[0], size = _b[1];
                            return files;
                        })];
            }
        });
    });
}
exports.divvyUp = divvyUp;
function runLint(piles, warnIgnored) {
    return __awaiter(this, void 0, void 0, function () {
        var tmp, lintData, eslint, formatter;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, fs_1.promises.mkdtemp(os.tmpdir() + "/")];
                case 1:
                    tmp = _a.sent();
                    return [4, Promise.all(piles.map(function (files, i) { return __awaiter(_this, void 0, void 0, function () {
                            var tmpFile, warn, buffer;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        tmpFile = tmp + "/" + i + ".json";
                                        warn = warnIgnored ? ["--warnIgnored"] : [];
                                        return [4, ts_await_spawn_1.default("node", ["threaded-lint/json-eslint.js", tmpFile].concat(warn).concat(files))];
                                    case 1:
                                        buffer = _a.sent();
                                        return [2, require(tmpFile)];
                                }
                            });
                        }); }))];
                case 2:
                    lintData = _a.sent();
                    eslint = new eslint_1.ESLint();
                    return [4, eslint.loadFormatter("stylish")];
                case 3:
                    formatter = _a.sent();
                    console.log(formatter.format(lintData.reduce(function (acc, item) { return acc.concat(item); }, [])));
                    return [2];
            }
        });
    });
}
exports.runLint = runLint;
//# sourceMappingURL=basic-threaded-lint.js.map
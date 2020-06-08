"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
exports.default = (function (command, args, options) {
    var child = child_process_1.spawn(command, args, options);
    var stdout = "";
    var stderr = "";
    if (child.stdout) {
        child.stdout.on("data", function (data) {
            stdout += data + "\n";
        });
    }
    if (child.stderr) {
        child.stderr.on("data", function (data) {
            stderr += data + "\n";
        });
    }
    var promise = new Promise(function (resolve, reject) {
        child.on("error", reject);
        child.on("exit", function (code) {
            if (code === 0) {
                resolve(stdout);
            }
            else {
                var err = new Error("child exited with code " + (code !== null && code !== void 0 ? code : "null") + "\noutput: " + stdout + "\nerror: " + stderr);
                reject(err);
            }
        });
    });
    return promise;
});
//# sourceMappingURL=ts-await-spawn.js.map
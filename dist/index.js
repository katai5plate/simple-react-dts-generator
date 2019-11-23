"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var fs = require("fs");
var path = require("path");
var safeStringify = require("json-stringify-safe");
module.exports = function (moduleName, dist) {
    if (dist === void 0) { dist = "./"; }
    var replace = function (opt) { return function (k, v) {
        var type = typeof v;
        for (var _i = 0, _a = Object.entries(opt); _i < _a.length; _i++) {
            var r = _a[_i];
            var rk = r[0], rv = r[1];
            if (type === rk)
                return rv(k, v);
        }
        return opt.default(k, v);
    }; };
    var ast = safeStringify(require(moduleName), replace({
        object: function (k, v) { return v; },
        function: function (k, v) { return v.toString(); },
        default: function (k, v) { return typeof v; }
    }), 2);
    // fs.writeFileSync(path.resolve(dist, `${moduleName}.json`), ast);
    var isFunction = function (x) { return !!x.match(/function/m) || !!x.match(/=>/m); };
    var isCamelCase = function (x) {
        return x.charAt(0) === x.charAt(0).toUpperCase() &&
            x !== x.toUpperCase() &&
            !x.match(/_/);
    };
    var getFunctionArgs = function (x) {
        var m = x.match(/function .*?\((.*?)\)\s*?\{/);
        return !m ? [] : m[1].split(",").map(function (y) { return y.trim(); });
    };
    var dts = Object.entries(JSON.parse(ast))
        .map(function (_a) {
        var k = _a[0], v = _a[1];
        var type = typeof v;
        if (type === "object") {
            if (Array.isArray(v)) {
                return "export const " + k + ": [" + v.join(", ") + "];";
            }
            // return `export interface ${k} ${JSON.stringify(v)};`;
            return "export const " + k + ": {};\n" + Object.entries(JSON.parse(safeStringify(v)))
                .map(function (x) { return "// " + x[0] + ": " + safeStringify(x[1]); })
                .join("\n");
        }
        if (isFunction(v))
            return __spreadArrays([
                isCamelCase(k)
                    ? "export const " + k + ": React.ComponentType<any>;"
                    : "export function " + k + "(" + getFunctionArgs(v)
                        .map(function (x, i, a) {
                        return a.length === 1 && a[0] === ""
                            ? ""
                            : x + "?: any" + (i === a.length - 1 ? "" : ", ");
                    })
                        .join("") + "): any;"
            ], v.split("\n").map(function (x, i) {
                // if (i === 0) return `// export const ${k} = ${x}`;
                return "// " + x;
            })).join("\n");
        return "export const " + k + ": " + v + ";";
    })
        .join("\n");
    fs.writeFileSync(path.resolve(dist, moduleName + ".d.ts"), "declare module \"" + moduleName + "\" {\n\n" + dts + "\n\n}");
};
//# sourceMappingURL=index.js.map
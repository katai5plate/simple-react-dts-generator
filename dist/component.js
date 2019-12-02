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
var propTypes_1 = require("./propTypes");
module.exports = function (moduleName, dist) {
    if (dist === void 0) { dist = "./"; }
    var dts = [propTypes_1.ReactTypesString];
    safeStringify(require(moduleName), function (replacerKey, replacerValue) {
        var type = typeof replacerValue;
        if (type === "function" && replacerValue.propTypes) {
            var isUnspecifiedName = replacerValue.name !== replacerKey;
            var componentName = replacerValue.name || replacerKey;
            var componentProps = propTypes_1.parser(replacerValue.propTypes);
            dts = __spreadArrays(dts, [
                isUnspecifiedName
                    ? __spreadArrays([
                        "export const " + replacerKey + ": React.ComponentType<" + componentProps + ">;"
                    ], (replacerValue.name
                        ? [
                            "// export const " + replacerValue.name + ": React.ComponentType<" + componentProps + ">;"
                        ]
                        : [])).join("\n")
                    : "export const " + componentName + ": React.ComponentType<" + componentProps + ">;"
            ]);
        }
        return replacerValue;
    }, 2);
    fs.writeFileSync(path.resolve(dist, moduleName + ".d.ts"), "declare module \"" + moduleName + "\" {\n\n" + dts.join("\n\n") + "\n\n}");
};
//# sourceMappingURL=component.js.map
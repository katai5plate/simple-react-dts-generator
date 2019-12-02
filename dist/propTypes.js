"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var mock = require("mock-require");
exports.ReactTypesString = "\ntype ReactComponentLike =\n  | string\n  | ((props: any, context?: any) => any)\n  | (new (props: any, context?: any) => any);\ninterface ReactElementLike {\n  type: ReactComponentLike;\n  props: any;\n  key: string | number | null;\n}\ninterface ReactNodeArray extends Array<ReactNodeLike> {}\ntype ReactNodeLike =\n  | {}\n  | ReactElementLike\n  | ReactNodeArray\n  | string\n  | number\n  | boolean\n  | null\n  | undefined;";
var Q = /** @class */ (function () {
    function Q(value, category) {
        this.$$q = true;
        this.category = category;
        this.value = value;
        this.isRequired = value;
    }
    return Q;
}());
var q = function (value, category) {
    if (category === void 0) { category = null; }
    return new Q(value, category);
};
var converter = {
    node: q("ReactNodeLike"),
    element: q("ReactElementLike"),
    elementType: q("ReactComponentLike"),
    string: q("string"),
    number: q("number"),
    bool: q("boolean"),
    object: q("object"),
    func: q("function"),
    any: q("any"),
    oneOfType: function (x) { return q(x, "union"); },
    arrayOf: function (x) { return q(x, "array"); },
    oneOf: function (x) {
        return q(x.map(function (v) { return "\"" + v + "\""; }), "union");
    },
    instanceOf: function (x) { return x.name; },
    shape: function (x) { return q(x, "obj"); },
    exact: function (x) { return q(x, "obj"); }
};
mock("prop-types", __assign(__assign({}, converter), { default: __assign(__assign({}, converter), { PropTypes: __assign({}, converter) }), PropTypes: __assign({}, converter) }));
var json2type = function (json) {
    return JSON.stringify(json)
        .replace(/"/g, " ")
        .replace(/ , /g, ", ")
        .replace(/ :/g, ":");
};
var proptypesToJson = function (propTypesObject) {
    return JSON.parse(JSON.stringify(propTypesObject), function (_, content) {
        if (content && typeof content === "object") {
            if (content.$$q || content instanceof Q) {
                switch (content.category) {
                    case "union":
                        var u = content.value.map(function (v) {
                            if (typeof v === "object") {
                                return JSON.stringify(v)
                                    .replace(/"/g, "")
                                    .replace(/,/g, " | ")
                                    .replace(/:/g, ": ")
                                    .replace(/[\[\]]/g, "");
                            }
                            return v;
                        });
                        return u.join(" | ");
                    case "array":
                        if (typeof content.value === "object")
                            return json2type(content.value) + "[]";
                        return content.value + "[]";
                    case "obj":
                        if (typeof content.value === "object")
                            return json2type(content.value);
                        return content.value;
                    default:
                        return content.value;
                }
            }
        }
        return content;
    });
};
// import * as PropTypes from "prop-types";
// const data = {
//   req: {
//     node: PropTypes.node.isRequired,
//     element: PropTypes.element.isRequired,
//     elementType: PropTypes.elementType.isRequired,
//     string: PropTypes.string.isRequired,
//     number: PropTypes.number.isRequired,
//     bool: PropTypes.bool.isRequired,
//     object: PropTypes.object.isRequired,
//     func: PropTypes.func.isRequired,
//     any: PropTypes.any.isRequired,
//     oneOfType: PropTypes.oneOfType([
//       PropTypes.string.isRequired,
//       PropTypes.number.isRequired
//     ]),
//     arrayOf: PropTypes.arrayOf(PropTypes.string.isRequired),
//     oneOf: PropTypes.oneOf(["a", "b", "c"]),
//     instanceOf: PropTypes.instanceOf(Date),
//     shape: PropTypes.shape({
//       x: PropTypes.string.isRequired,
//       y: PropTypes.number.isRequired
//     }),
//     exact: PropTypes.exact({
//       x: PropTypes.string.isRequired,
//       y: PropTypes.shape({
//         x: PropTypes.string.isRequired,
//         y: PropTypes.number.isRequired
//       })
//     })
//   },
//   opt: {
//     node: PropTypes.node,
//     element: PropTypes.element,
//     elementType: PropTypes.elementType,
//     string: PropTypes.string,
//     number: PropTypes.number,
//     bool: PropTypes.bool,
//     object: PropTypes.object,
//     func: PropTypes.func,
//     any: PropTypes.any,
//     oneOfType: PropTypes.oneOfType([
//       PropTypes.shape({
//         x: PropTypes.string,
//         y: PropTypes.number
//       }),
//       PropTypes.number
//     ]),
//     arrayOf: PropTypes.arrayOf(
//       PropTypes.shape({
//         x: PropTypes.string,
//         y: PropTypes.number
//       })
//     ),
//     oneOf: PropTypes.oneOf(["a", "b", "c"]),
//     instanceOf: PropTypes.instanceOf(Date),
//     shape: PropTypes.shape({
//       x: PropTypes.string,
//       y: PropTypes.number
//     }),
//     exact: PropTypes.exact({
//       x: PropTypes.string,
//       y: PropTypes.shape({
//         x: PropTypes.string,
//         y: PropTypes.number
//       })
//     })
//   }
// };
exports.parser = function (propTypesObject) {
    var json = proptypesToJson(propTypesObject);
    return "{" + Object.entries(json)
        .map(function (_a) {
        var k = _a[0], v = _a[1];
        return k + ": " + v;
    })
        .join("; ") + "}";
};
// console.log("req", parser(data.req));
// console.log("opt", parser(data.opt));
//# sourceMappingURL=propTypes.js.map
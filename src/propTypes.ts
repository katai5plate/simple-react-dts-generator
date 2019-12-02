import * as mock from "mock-require";

export const ReactTypesString = `
type ReactComponentLike =
  | string
  | ((props: any, context?: any) => any)
  | (new (props: any, context?: any) => any);
interface ReactElementLike {
  type: ReactComponentLike;
  props: any;
  key: string | number | null;
}
interface ReactNodeArray extends Array<ReactNodeLike> {}
type ReactNodeLike =
  | {}
  | ReactElementLike
  | ReactNodeArray
  | string
  | number
  | boolean
  | null
  | undefined;`;

class Q {
  $$q: true;
  category: string;
  value: string | string[] | object;
  isRequired: string;
  constructor(value, category) {
    this.$$q = true;
    this.category = category;
    this.value = value;
    this.isRequired = value;
  }
}

const q = (value, category = null) => new Q(value, category);

const converter = {
  node: q("ReactNodeLike"),
  element: q("ReactElementLike"),
  elementType: q("ReactComponentLike"),
  string: q("string"),
  number: q("number"),
  bool: q("boolean"),
  object: q("object"),
  func: q("function"),
  any: q("any"),
  oneOfType: x => q(x, "union"),
  arrayOf: x => q(x, "array"),
  oneOf: x =>
    q(
      x.map(v => `"${v}"`),
      "union"
    ),
  instanceOf: x => x.name,
  shape: x => q(x, "obj"),
  exact: x => q(x, "obj")
};

mock("prop-types", {
  ...converter,
  default: {
    ...converter,
    PropTypes: {
      ...converter
    }
  },
  PropTypes: {
    ...converter
  }
});

const json2type = json =>
  JSON.stringify(json)
    .replace(/"/g, " ")
    .replace(/ , /g, ", ")
    .replace(/ :/g, ":");

const proptypesToJson = propTypesObject =>
  JSON.parse(JSON.stringify(propTypesObject), (_: never, content: Q) => {
    if (content && typeof content === "object") {
      if (content.$$q || content instanceof Q) {
        switch (content.category) {
          case "union":
            const u = (content.value as string[]).map(v => {
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
              return `${json2type(content.value)}[]`;
            return `${content.value}[]`;
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

export const parser = propTypesObject => {
  const json = proptypesToJson(propTypesObject);
  return `{${Object.entries(json)
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ")}}`;
};

// console.log("req", parser(data.req));
// console.log("opt", parser(data.opt));

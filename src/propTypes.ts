import * as mock from "mock-require";

export const ReactTypesString: string = `
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
  func: q("Function"),
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

export const proptypesToJson = propTypesObject =>
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
              if (
                ![
                  "string",
                  "number",
                  "bigint",
                  "boolean",
                  "symbol",
                  "undefined",
                  "object",
                  "function"
                ].includes(v)
              ) {
                return v.replace(/"/g, "'");
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
//   x: PropTypes.shape({
//     field: PropTypes.string,
//     order: PropTypes.oneOf(["ASC", "DESC"])
//   })
// };

export const parser = propTypesObject => {
  const json = proptypesToJson(propTypesObject);
  return `{${Object.entries(json)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ")}}`;
};

// console.log("req", parser(data));
// console.log("opt", parser(data.opt));

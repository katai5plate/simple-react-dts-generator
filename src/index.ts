import * as fs from "fs";
import * as path from "path";
import * as safeStringify from "json-stringify-safe";

export = (moduleName: string, dist: string = "./") => {
  const replace = (opt: {
    string?: (k: string, v: string) => any;
    number?: (k: string, v: number) => any;
    bigint?: (k: string, v: bigint) => any;
    boolean?: (k: string, v: boolean) => any;
    symbol?: (k: string, v: symbol) => any;
    undefined?: (k: string, v: undefined) => any;
    object?: (k: string, v: {}) => any;
    function?: (k: string, v: Function) => any;
    default: (k: string, v: any) => any;
  }) => (k: string, v: any) => {
    const type = typeof v;
    for (let r of Object.entries(opt)) {
      const [rk, rv] = r;
      if (type === rk) return rv(k, v);
    }
    return opt.default(k, v);
  };
  const ast: string = safeStringify(
    require(moduleName),
    replace({
      object: (k, v) => v,
      function: (k, v) => v.toString(),
      default: (k, v) => typeof v
    }),
    2
  );

  // fs.writeFileSync(path.resolve(dist, `${moduleName}.json`), ast);

  const isFunction = (x: string) => !!x.match(/function/m) || !!x.match(/=>/m);
  const isCamelCase = (x: string) =>
    x.charAt(0) === x.charAt(0).toUpperCase() &&
    x !== x.toUpperCase() &&
    !x.match(/_/);
  const getFunctionArgs = (x: string) => {
    const m = x.match(/function .*?\((.*?)\)\s*?\{/);
    return !m ? [] : m[1].split(",").map((y: string) => y.trim());
  };
  const dts = Object.entries(JSON.parse(ast))
    .map(([k, v]: [string, string]) => {
      const type = typeof v;
      if (type === "object") {
        if (Array.isArray(v)) {
          return `export const ${k}: [${v.join(", ")}];`;
        }
        // return `export interface ${k} ${JSON.stringify(v)};`;
        return `export const ${k}: {};\n${Object.entries(
          JSON.parse(safeStringify(v))
        )
          .map(x => `// ${x[0]}: ${safeStringify(x[1])}`)
          .join("\n")}`;
      }
      if (isFunction(v))
        return [
          isCamelCase(k)
            ? `export const ${k}: React.ComponentType<any>;`
            : `export function ${k}(${getFunctionArgs(v)
                .map((x, i, a) =>
                  a.length === 1 && a[0] === ""
                    ? ""
                    : `${x}?: any${i === a.length - 1 ? "" : ", "}`
                )
                .join("")}): any;`,
          ...v.split("\n").map((x, i) => {
            // if (i === 0) return `// export const ${k} = ${x}`;
            return `// ${x}`;
          })
        ].join("\n");
      return `export const ${k}: ${v};`;
    })
    .join("\n");
  fs.writeFileSync(
    path.resolve(dist, `${moduleName}.d.ts`),
    `declare module "${moduleName}" {\n\n${dts}\n\n}`
  );
};

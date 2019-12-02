import * as fs from "fs";
import * as path from "path";
import * as safeStringify from "json-stringify-safe";
import { parser, ReactTypesString } from "./propTypes";
export = (moduleName: string, dist: string = "./") => {
  let dts = [ReactTypesString];
  safeStringify(
    require(moduleName),
    (replacerKey: string, replacerValue: any) => {
      const type = typeof replacerValue;
      if (type === "function" && replacerValue.propTypes) {
        const isUnspecifiedName = replacerValue.name !== replacerKey;
        const componentName = replacerValue.name || replacerKey;
        const componentProps = parser(replacerValue.propTypes);
        dts = [
          ...dts,
          isUnspecifiedName
            ? [
                `export const ${replacerKey}: React.ComponentType<${componentProps}>;`,
                ...(replacerValue.name
                  ? [
                      `// export const ${replacerValue.name}: React.ComponentType<${componentProps}>;`
                    ]
                  : [])
              ].join("\n")
            : `export const ${componentName}: React.ComponentType<${componentProps}>;`
        ];
      }
      return replacerValue;
    },
    2
  );
  fs.writeFileSync(
    path.resolve(dist, `${moduleName}.d.ts`),
    `declare module "${moduleName}" {\n\n${dts.join("\n\n")}\n\n}`
  );
};

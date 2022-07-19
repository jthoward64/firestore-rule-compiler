import Ajv from "ajv";
import { ValueScope } from "ajv/dist/compile/codegen/scope";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { Model } from "./lib/Model";
import { defsSchema, schema } from "./lib/schema";
import { renderSchema } from "./mustache/render";
import { failWithMessage } from "./util";

export function main(inputFile: string, outputFile?: string) {
  if (!existsSync(inputFile)) {
    console.error('Invalid arguments: File does not exist');
    process.exit(1);
  }

  const file = readFileSync(inputFile, 'utf8');
  const json = JSON.parse(file);

  const ajv = new Ajv({
    allowUnionTypes: true,
    //@ts-expect-error Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.
    verbose: !!(global.debug),
    //@ts-expect-error Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.
    logger: global.debug ? console.log : undefined,
  })

  // serialize will only accept data compatible with MyData
  const validate = ajv.addSchema(defsSchema).compile(schema);

  if (!validate(json)) {
    failWithMessage(JSON.stringify(validate.errors, null, 2));
  }

  const model = Model.fromJSON(json);
  const rules = model.flatten();
  const output = renderSchema(rules);

  writeFileSync(outputFile ?? (inputFile.slice(0, inputFile.indexOf('.', Math.max(inputFile.lastIndexOf('/') ?? 0, inputFile.lastIndexOf('\\') ?? 0))) + '.rules'), output);
}

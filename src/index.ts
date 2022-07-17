import { existsSync, readFileSync, writeFileSync } from "fs";
import { Model } from "./lib/Model";
import { renderSchema } from "./mustache/render";

export function main(inputFile: string, outputFile?: string) {
  if (!existsSync(inputFile)) {
    console.error('Invalid arguments: File does not exist');
    process.exit(1);
  }

  const file = readFileSync(inputFile, 'utf8');
  const json = JSON.parse(file);

  const model = Model.fromJSON(json);
  const rules = model.flatten();
  const output = renderSchema(rules);

  writeFileSync(outputFile ?? (inputFile.slice(0, inputFile.indexOf('.', Math.max(inputFile.lastIndexOf('/') ?? 0, inputFile.lastIndexOf('\\') ?? 0))) + '.rules'), output);
}

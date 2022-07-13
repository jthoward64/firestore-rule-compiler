import { existsSync, readFileSync, writeFileSync } from "fs";
import { renderSchema } from "./rules/render";
import makeRules from "./rules/schemaToRules";
import { validateSchema } from "./schema/validate";

export function main(inputFile: string, outputFile?: string) {
  if (!existsSync(inputFile)) {
    console.error('Invalid arguments: File does not exist');
    process.exit(1);
  }

  const file = readFileSync(inputFile, 'utf8');
  const json = JSON.parse(file);


  if (!validateSchema(json)) {
    console.error('Invalid schema');
    process.exit(1);
  }

  const rules = makeRules(json);

  const output = renderSchema(rules);

  if (outputFile !== undefined) {
    writeFileSync(outputFile, output);
  } else {
    console.log("\nGenerated Firestore Rules:\n");
    console.log(output);
  }
}

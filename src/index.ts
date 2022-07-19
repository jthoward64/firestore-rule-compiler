import Ajv from "ajv";
import { existsSync, readFileSync, writeFileSync, constants } from "fs";
import { Model } from "./lib/Model";
import { defsSchema, schema } from "./lib/schema";
import { renderSchema } from "./mustache/render";
import { failWithMessage, log } from "./util";

export function main(inputFile: string, outputFile?: string) {
  log("Starting...");
  log(`Checking for input file at ${inputFile}`);

  if (!existsSync(inputFile)) {
    failWithMessage('Invalid arguments: File does not exist');
  }
  log("Input file found");

  log("Reading input file contents");
  const file = readFileSync(inputFile, 'utf8');
  log("Input file contents read");

  log("Paring input file contents");
  const json = JSON.parse(file);
  log("Input file parsed");

  log("initializing ajv");
  const ajv = new Ajv({
    allowUnionTypes: true,
    verbose: globalThis.debugMode,
    logger: globalThis.debugMode ? { error: console.error, warn: console.warn, log: console.log } : undefined,
  });
  log("ajv successfully initialized");

  log("Validating input file contents");
  const validate = ajv.addSchema(defsSchema).compile(schema);
  log("Input file validated");

  if (!validate(json)) {
    failWithMessage(JSON.stringify(validate.errors, null, 2));
  }

  log("Constructing model");
  const model = Model.fromJSON(json);
  log("Model constructed");

  log("Flattening model");
  const rules = model.flatten();
  log("Model flattened");

  log("Rendering rules");
  const output = renderSchema(rules);
  log("Rules rendered");

  if (outputFile) {
    log(`Writing output file: ${outputFile}`);
    writeFileSync(outputFile, output);
    log(`Output file written`);
  } else {
    log("No output file specified, guessing output file name");

    const fileExtensionIndex = inputFile.indexOf('.', Math.max(inputFile.lastIndexOf('/') ?? 0, inputFile.lastIndexOf('\\') ?? 0));

    let outputFilePath;
    if (fileExtensionIndex === -1) {
      log("No file extension found, adding .rules");
      outputFilePath = inputFile + '.rules';
    } else {
      log("File extension found, replacing extension with .rules");
      outputFilePath = inputFile.slice(0, fileExtensionIndex) + '.rules';
    }

    log(`Writing output file: ${outputFilePath}`);
    writeFileSync(outputFilePath, output);
    log(`Output file written`);
  }
}

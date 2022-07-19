#!/usr/bin/env node
import { Command } from "commander";
import { main } from ".";
import { failWithMessage } from "./util";

declare global {
  var debugMode: boolean;
}
globalThis.debugMode = false;

let program = new Command("Firestore Rule Compiler");

program
  .option('-d, --debug', 'output extra debugging')
  .version(require('../package.json').version)
  .argument('<inputFile>', 'json model file to load')
  .option('-o, --output <path>', 'where to save the generated rules')
  .action((inputFile, { debug, output: outputFile }) => {
    globalThis.debugMode = debug ?? false;

    main(inputFile, outputFile);
  });


program.parse();

#!/usr/bin/env node
import { main } from ".";
import { log, failWithMessage } from "./util";

declare global {
  var debugMode: boolean;
}
globalThis.debugMode = false;

const args = process.argv.slice(3);

let outputFile: string | undefined;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--help") {
    console.log(`
    Usage: ${require("./package.json").name} input.json [output.rules] [options]
    Options:
      --version, -v: Prints the version of the tool.
      --debug: Enable debug mode.
      --help: Show this help menu.
    `);
    process.exit(0);
  } else if (args[i] === "--version" || args[i] === "-v") {
    console.log(`v${require("./package.json").version}`);
    process.exit(0);
  } else if (args[i] === "--debug") {
    globalThis.debugMode = true;
    log("Debug mode enabled");
  } else if (args[i].startsWith("-")) {
    failWithMessage(`Unknown argument: "${args[i]}"`);
  } else {
    if (outputFile != null) {
      failWithMessage(`Invalid arguments: Too many output files, make sure all flags begin with a dash (${args[i]})`);
    }
    outputFile = args[i];
  }
}

if (args.length < 1) {
  failWithMessage('Err: Expected an input file');
}

main(process.argv[2], outputFile);
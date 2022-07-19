#!/usr/bin/env node
import { main } from ".";
import { log, failWithMessage } from "./util";

declare global {
  var debugMode: boolean;
}
globalThis.debugMode = false;

const args = process.argv.slice(2);

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--help") {
    console.log(`
    Usage: ${require("./package.json").name} [options] input.json [output.rules]
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
  }
}

if (args.length < 1) {
  failWithMessage('Invalid arguments: Expected at least one argument');
}

main(args[0], args[1]);
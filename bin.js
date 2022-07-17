#!/usr/bin/env node
const { main } = require("./dist");

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
    global.debugMode = true;
  }
}

if (args.length < 1) {
  console.error('Invalid arguments: Expected at least one argument');
  process.exit(1);
}

main(args[0], args[1]);
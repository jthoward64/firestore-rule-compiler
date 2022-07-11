#!/usr/bin/env node
const { main } = require("./dist");

const args = process.argv.slice(2);

if (args.length < 1) {
  console.error('Invalid arguments: Expected at least one argument');
  process.exit(1);
}

main(args[0], args[1]);
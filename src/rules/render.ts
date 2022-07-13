import { readFileSync } from "fs";
import Mustache from "mustache";
import { Rules } from "./rules";

export function renderSchema(schema: Rules): string {
  return Mustache.render(readFileSync(__dirname + "\\mustache\\root.mustache", "utf8"), schema, (name) => readFileSync(__dirname + "\\mustache\\" + name + ".mustache", "utf8"), { escape: (val) => val });
}
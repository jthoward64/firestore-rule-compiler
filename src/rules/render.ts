import { readFileSync } from "fs";
import Mustache from "mustache";
import { Schema } from "../schema/schema";

export function renderSchema(schema: Schema): string {
  return Mustache.render(readFileSync(__dirname + "\\mustache\\root.mustache", "utf8"), schema, (name) => readFileSync(__dirname + "\\mustache\\" + name + ".mustache", "utf8"), { escape: (val) => val });
}
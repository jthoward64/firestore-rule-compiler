import { readFileSync } from "fs";
import Mustache from "mustache";
import { log } from "../util";
import { Rules } from "./rules";

export function renderSchema(schema: Rules): string {
  log(`Loading base template as ${__dirname + "\\root.mustache"}`);
  return Mustache.render(
    readFileSync(
      __dirname + "\\root.mustache", "utf8"
    ),
    schema,
    (name) => {
      log(`Loading template (${name}) as ${__dirname + "\\" + name + ".mustache"}`);
      return readFileSync(
        __dirname + "\\" + name + ".mustache", "utf8"
      )
    },
    {
      escape: (val) => val
    }
  );
}

import { readFileSync } from "fs";
import Mustache from "mustache";
import { log } from "../util";
import { Rules } from "./rules";

const fileSeparator = process.platform === "win32" ? "\\" : "/";

export function renderSchema(schema: Rules): string {
  log(`Loading base template as ${__dirname}${fileSeparator}root.mustache`);
  return Mustache.render(
    readFileSync(
      `${__dirname}${fileSeparator}root.mustache`, "utf8"
    ),
    { ...schema, headerComment: `Generated on ${new Date().toLocaleString()}` },
    (name) => {
      log(`Loading template (${name}) as ${__dirname}${fileSeparator}${name}.mustache`);
      return readFileSync(
        `${__dirname}${fileSeparator}${name}.mustache`, "utf8"
      )
    },
    {
      escape: (val) => val
    }
  );
}

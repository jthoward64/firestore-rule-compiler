import prettier from "prettier";
import { FlatMatch, Rules } from "../mustache/rules";
import { failWithMessage } from "../util";
import { Match } from "./Match";

export class Model {
  /**
   * The top level match parameter (i.e. /databases/{database}/documents)
   */
  topLevelMatchPath: string;
  /**
   * An array of matches to place in the rules
   */
  matches?: Match[];
  /**
   * An array of functions (strings) to place at the bottom of the rules, prettified automatically, though no syntax checking is performed
   */
  customFunctions?: string[];

  constructor(topLevelMatchPath: string, matches?: Match[], customFunctions?: string[]) {
    this.topLevelMatchPath = topLevelMatchPath;
    this.matches = matches;
    this.customFunctions = customFunctions;
  }

  flatten(): Rules {
    const rules: Rules = {
      topLevelMatchPath: this.topLevelMatchPath,
    };

    if (Array.isArray(this.matches)) {
      const matches: FlatMatch[] = [];
      for (const match of this.matches) {
        matches.push(match.specify().flatten());
      }
      rules.matches = matches.map((match) => Match.expandFlatMatch(match));
    }

    if (Array.isArray(this.customFunctions)) {
      rules.customFunctions = this.customFunctions.map(customFunction => prettier.format(customFunction, { parser: "babel", endOfLine: "lf" }).replace(/\n/g, "\n    "));
    }

    return rules;
  }

  static fromJSON(json: any): Model {
    if (typeof json !== "object" || Array.isArray(json)) {
      failWithMessage("Model must be an object:\n" + JSON.stringify(json, null, 2));
    }

    if (json.topLevelMatchPath == undefined) {
      failWithMessage("topLevelMatchPath is required");
    } else if (typeof json.topLevelMatchPath !== "string") {
      failWithMessage("topLevelMatchPath must be a string");
    }

    return new Model(json.topLevelMatchPath, json.matches == undefined ? undefined : json.matches.map((match: Match) => Match.fromJson(match)), json.customFunctions);
  }
}
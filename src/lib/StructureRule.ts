import { FlatStructureRule } from "../mustache/rules";
import { failWithMessage } from "../util";
import { FirestoreType } from "./enums";

export interface StructureRuleObj {
  field: string;
  type?: FirestoreType[];
  required?: boolean;
}

export class StructureRule {
  /**
   * The name of the field to check
   */
  field: string;
  /**
   * The allowed types for the field
   * If type is not specified, just make sure the field exists and ignore type (results in no effect to update)
   */
  type?: FirestoreType[];
  /**
   * Is the field required?
   */
  required?: boolean;

  constructor(field: string, type?: FirestoreType[], required?: boolean) {
    this.field = field;
    this.type = type;
    this.required = required;
  }

  flatten(): FlatStructureRule {
    const flatStructureRule: FlatStructureRule = {
      field: this.field,
    };

    if (this.type) {
      flatStructureRule.type = this.type;
    }

    if (this.required) {
      flatStructureRule.required = this.required;
    }

    return flatStructureRule;
  }

  static fromJson(json: StructureRuleObj): StructureRule {
    return new StructureRule(json.field, json.type, json.required);
  }
}

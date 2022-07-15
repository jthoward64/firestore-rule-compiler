import { FlatStructureRule } from "../mustache/rules";
import { FirestoreType } from "./enums";

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

  static fromJson(json: any): StructureRule {
    if (json.field == null) {
      throw new Error("StructureRule must have a field");
    }

    const { field: jsonField, type: jsonType, required: jsonRequired } = json;

    let field: string;
    let type: FirestoreType[];
    let required: boolean;

    if (typeof jsonField !== "string") {
      throw new Error("StructureRule field must be a string");
    } else {
      field = jsonField;
    }

    if (jsonType == null) {
      type = jsonType;
    } else if (!Array.isArray(jsonType)) {
      throw new Error("StructureRule type must be an array");
    } else if (Array.isArray(jsonType) && jsonType.length > 0 && jsonType.every(type => typeof type === "string")) {
      type = jsonType;
    } else {
      throw new Error("StructureRule type must be an array of types");
    }

    if (jsonRequired != null && typeof jsonRequired !== "boolean") {
      throw new Error("StructureRule required must be a boolean");
    } else {
      required = jsonRequired;
    }

    return new StructureRule(field, type, required);
  }
}

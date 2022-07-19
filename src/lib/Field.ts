import { failWithMessage } from "../util";
import { AnyOperator } from "./enums";

export interface FieldObj {
  fieldA: FieldObj | string;
  comparator: keyof AnyOperator;
  fieldB: FieldObj | string;
}



export class Field {
  /**
   * The lefthand field to compare, can be a field object, or a string that is taken literally
   */
  fieldA: Field | string;
  /**
   * The comparator to put between the two fields
   */
  operator: AnyOperator;
  /**
   * The righthand field to compare, can be a field object, or a string that is taken literally
   */
  fieldB: Field | string;

  constructor(fieldA: Field | string, operator: AnyOperator, fieldB: Field | string) {
    this.fieldA = fieldA;
    this.operator = operator;
    this.fieldB = fieldB;
  }

  flatten(): string {
    if (typeof this.fieldA === "string" && typeof this.fieldB === "string") {
      return `${this.fieldA} ${this.operator} ${this.fieldB}`;
    } else if (typeof this.fieldA === "string" && typeof this.fieldB !== "string") {
      return `$({this.fieldA} ${this.operator} ${this.fieldB.flatten()})`;
    } else if (typeof this.fieldA !== "string" && typeof this.fieldB === "string") {
      return `(${this.fieldA.flatten()} ${this.operator} ${this.fieldB})`;
    } else if (typeof this.fieldA !== "string" && typeof this.fieldB !== "string") {
      return `(${this.fieldA.flatten()} ${this.operator} ${this.fieldB.flatten()})`;
    }
    failWithMessage(`Field.flatten() was called for a field that may not have been a string or a field object`);
  }

  static fromJson(json: FieldObj): Field {
    return new Field(typeof json.fieldA === "string" ? json.fieldA : Field.fromJson(json.fieldA), json.comparator as AnyOperator, typeof json.fieldB === "string" ? json.fieldB : Field.fromJson(json.fieldB));
  }
}
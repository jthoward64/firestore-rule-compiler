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
    return `(${this.fieldA}) ${this.operator} (${this.fieldB})`;
  }

  static fromJson(json: FieldObj): Field {
    return new Field(typeof json.fieldA === "string" ? json.fieldA : Field.fromJson(json.fieldA), json.comparator as AnyOperator, typeof json.fieldB === "string" ? json.fieldB : Field.fromJson(json.fieldB));
  }
}
import { AnyOperator } from "./enums";

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

  static fromJson(json: any): Field {
    let fieldA: Field | string;
    let fieldB: Field | string;
    let operator: AnyOperator;

    if (json.fieldA == null || json.fieldB == null || json.operator == null) {
      throw new Error("Invalid Json for Field:\n" + JSON.stringify(json));
    }

    const { fieldA: fieldAJson, fieldB: fieldBJson, operator: operatorJson } = json;

    if (typeof fieldAJson === "string") {
      fieldA = fieldAJson;
    } else if (typeof fieldAJson === "object") {
      fieldA = Field.fromJson(fieldAJson);
    } else {
      throw new Error("Invalid fieldA for Field:\n" + JSON.stringify(fieldAJson, null, 2));
    }

    if (typeof fieldBJson === "string") {
      fieldB = fieldBJson;
    } else if (typeof fieldBJson === "object") {
      fieldB = Field.fromJson(fieldBJson);
    } else {
      throw new Error("Invalid fieldB for Field:\n" + JSON.stringify(fieldBJson, null, 2));
    }

    if (typeof operatorJson === "string" && Object.keys(AnyOperator).includes(operatorJson)) {
      operator = operatorJson as AnyOperator;
    } else {
      throw new Error("Invalid operator for Field:\n" + JSON.stringify(operatorJson, null, 2));
    }

    return new Field(fieldA, operator, fieldB);
  }
}

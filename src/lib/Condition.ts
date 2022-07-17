import { failWithMessage } from "../util";
import { ComparisonOperator } from "./enums";
import { Field } from "./Field";

export class Condition {
  /**
   * The lefthand field to compare, can be a field object, or a string that is taken literally
   */
  fieldA: Field | string;
  /**
   * The comparator to put between the two fields
   */
  comparator: ComparisonOperator;
  /**
   * The righthand field to compare, can be a field object, or a string that is taken literally
   */
  fieldB: Field | string;
  /**
   * Should the expression be preceded by "!"
   */
  isInverted?: boolean;
  /**
   * If provided, the other options will be ignored and this string will be used literally
   */
  customOverride?: string;

  constructor(fieldA: Field | string, comparator: ComparisonOperator, fieldB: Field | string, isInverted?: boolean, customOverride?: string) {
    this.fieldA = fieldA;
    this.comparator = comparator;
    this.fieldB = fieldB;
    this.isInverted = isInverted;
    this.customOverride = customOverride;
  }

  flatten(): string {
    if (this.customOverride) {
      return this.customOverride;
    }

    let flatFieldA: string;
    let flatFieldB: string;

    let shouldWrap = false;

    if (typeof this.fieldA === 'string') {
      flatFieldA = this.fieldA;
    } else {
      flatFieldA = '(' + this.fieldA.flatten() + ')';
    }

    if (typeof this.fieldB === 'string') {
      flatFieldB = this.fieldB;
    } else {
      flatFieldB = '(' + this.fieldB.flatten() + ')';
    }

    if (this.isInverted) {
      return `!(${flatFieldA} ${this.comparator} ${flatFieldB})`;
    } else {
      return `${flatFieldA} ${this.comparator} ${flatFieldB}`;
    }
  }

  static fromJson(json: any): Condition {
    if (json.fieldA == null || json.fieldB == null || json.comparator == null) {
      failWithMessage("Field A/B and comparator are required:\n" + JSON.stringify(json));
    }

    const { fieldA: fieldAJson, fieldB: fieldBJson, comparator: comparatorJson, isInverted: isInvertedJson, customOverride: customOverrideJson } = json;

    let fieldA: Field | string;
    let fieldB: Field | string;
    let comparator: ComparisonOperator;
    let isInverted: boolean;
    let customOverride: string;

    if (typeof fieldAJson === "string") {
      fieldA = fieldAJson;
    } else if (typeof fieldAJson === "object") {
      fieldA = Field.fromJson(fieldAJson);
    } else {
      failWithMessage("Invalid fieldA for Condition:\n" + JSON.stringify(fieldAJson, null, 2));
    }

    if (typeof fieldBJson === "string") {
      fieldB = fieldBJson;
    } else if (typeof fieldBJson === "object") {
      fieldB = Field.fromJson(fieldBJson);
    } else {
      failWithMessage("Invalid fieldB for Condition:\n" + JSON.stringify(fieldBJson, null, 2));
    }

    if (typeof comparatorJson === "string" && Object.keys(ComparisonOperator).includes(comparatorJson)) {
      comparator = comparatorJson as ComparisonOperator;
    } else {
      failWithMessage("Invalid comparator for Condition:\n" + JSON.stringify(comparatorJson, null, 2));
    }

    if (isInvertedJson != null && typeof isInvertedJson !== "boolean") {
      failWithMessage("Invalid isInverted for Condition:\n" + JSON.stringify(isInvertedJson, null, 2));
    }

    if (customOverrideJson != null && typeof customOverrideJson !== "string") {
      failWithMessage("Invalid customOverride for Condition:\n" + JSON.stringify(customOverrideJson, null, 2));
    }

    return new Condition(fieldA, comparator, fieldB, isInvertedJson, customOverrideJson);
  }
}
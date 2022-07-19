import { failWithMessage } from "../util";
import { ComparisonOperator } from "./enums";
import { Field, FieldObj } from "./Field";

export interface ConditionObj {
  fieldA: FieldObj | string;
  comparator: keyof ComparisonOperator;
  fieldB: FieldObj | string;
  isInverted?: boolean;
  customOverride?: string;
}

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

  static fromJson(json: ConditionObj): Condition {
    return new Condition(typeof json.fieldA === "string" ? json.fieldA : Field.fromJson(json.fieldA), json.comparator as ComparisonOperator, typeof json.fieldB === "string" ? json.fieldB : Field.fromJson(json.fieldB), json.isInverted, json.customOverride);
  }
}
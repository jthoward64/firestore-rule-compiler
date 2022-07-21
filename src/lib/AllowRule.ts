import { FlatAllowRule } from "../mustache/rules";
import { failWithMessage } from "../util";
import { Condition, ConditionObj } from "./Condition";
import { RuleMethod } from "./enums";

export interface AllowRuleObj {
  methods: RuleMethod[];
  conditions?: (ConditionObj | string)[];
  requireAuth?: boolean;
  requiredClaims?: {
    name: string,
    value?: string | number | boolean
  }[];
}

export class AllowRule {
  /**
   * The methods to allow if the conditions are met
   */
  methods: RuleMethod[];
  /**
   * A list of conditions that must be met for the rule to be allowed, joined by "&&"
   */
  conditions?: (Condition | string)[];
  /**
   * If true adds "request.auth != null" to the condition
   */
  requireAuth?: boolean;
  /**
   * Adds a rule for each claim, if value is set for the claim,
   * adds "request.auth.token.${name} == ${value}" to the
   * condition, otherwise adds "request.auth.token.${name} != null"
   */
  requiredClaims?: {
    name: string,
    value?: string | number | boolean
  }[];

  constructor(methods: RuleMethod[], conditions?: (Condition | string)[], requireAuth?: boolean, requiredClaims?: {
    name: string,
    value?: string | number | boolean
  }[]) {
    this.methods = methods;
    this.conditions = conditions;
    this.requireAuth = requireAuth;
    this.requiredClaims = requiredClaims;
  }

  flatten(): FlatAllowRule {
    const flatAllowRule: FlatAllowRule = {
      method: this.methods
    };

    const flatConditions: string[] = [];

    if (Array.isArray(this.conditions) && this.conditions.length > 0) {
      this.conditions.forEach(condition => {
        flatConditions.push(typeof condition === "string" ? condition : condition.flatten());
      });
    }
    if (this.requireAuth) {
      flatConditions.push("request.auth != null");
    }
    if (Array.isArray(this.requiredClaims) && this.requiredClaims.length > 0) {
      this.requiredClaims.forEach(claim => {
        let requiresBracket = false;
        for (let i = 0; i < claim.name.length; i++) {
          if (claim.name.charCodeAt(i) > 127) {
            requiresBracket = true;
            break;
          }
        }

        let flatCondition = "request.auth.token";
        flatCondition += requiresBracket ? `.${claim.name} ` : `['${claim.name}'] `;

        if (claim.value == null) {
          flatCondition += `!= null`;
        } else {
          switch (typeof claim.value) {
            case "string":
              flatCondition += `== "${claim.value}"`;
              break;
            case "number":
            case "boolean":
              flatCondition += `== ${claim.value}`;
              break;
            default:
              failWithMessage(`Unsupported claim value type: ${typeof claim.value} for claim ${claim.name} in:\n${JSON.stringify(this, null, 2)}`);
          }
        }

        flatConditions.push(flatCondition);
      });
    }

    flatAllowRule.conditions = flatConditions;

    return flatAllowRule;
  }

  static fromJson(json: AllowRuleObj): AllowRule {
    return new AllowRule(json.methods, json.conditions == null ? json.conditions : json.conditions.map((condition) => typeof condition === "string" ? condition : Condition.fromJson(condition)), json.requireAuth, json.requiredClaims);
  }
}

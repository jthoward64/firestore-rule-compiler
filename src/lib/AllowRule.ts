import { FlatAllowRule } from "../mustache/rules";
import { failWithMessage } from "../util";
import { Condition } from "./Condition";
import { RuleMethod } from "./enums";

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

      flatAllowRule.conditions = flatConditions;
    }

    return flatAllowRule;
  }

  static fromJson(json: any): AllowRule {
    if (json.methods == null) {
      failWithMessage("methods is required");
    }

    const { methods: jsonMethods, conditions: jsonConditions, requireAuth: jsonRequireAuth, requiredClaims: jsonRequiredClaims } = json;

    let methods: RuleMethod[];
    let conditions: (Condition | string)[] | undefined;
    let requireAuth: boolean | undefined;
    let requiredClaims: {
      name: string,
      value?: string | number | boolean
    }[] | undefined;

    if (Array.isArray(jsonMethods) && jsonMethods.length > 0) {
      methods = jsonMethods;
    } else {
      failWithMessage("methods is required");
    }

    if (jsonConditions == null) {
      conditions = undefined;
    } else {
      conditions = [];

      for (const condition of jsonConditions) {
        if (typeof condition === "string") {
          conditions.push(condition);
        } else {
          conditions.push(Condition.fromJson(condition));
        }
      }
    }

    if (jsonRequireAuth == null) {
      requireAuth = undefined;
    } else if (typeof jsonRequireAuth === "boolean") {
      requireAuth = jsonRequireAuth;
    } else {
      failWithMessage("requireAuth must be a boolean");
    }

    if (jsonRequiredClaims == null) {
      requiredClaims = undefined;
    } else {
      requiredClaims = [];

      for (const requiredClaim of jsonRequiredClaims) {
        if (typeof requiredClaim === "object" && requiredClaim.name != null && typeof requiredClaim.name === "string" && (requiredClaim.value == null || typeof requiredClaim.value === "string" || typeof requiredClaim.value === "number" || typeof requiredClaim.value === "boolean")) {
          requiredClaims.push(requiredClaim);
        } else {
          failWithMessage("requiredClaims must be an array of objects with name and possibly a value of type string, number, or boolean");
        }
      }
    }

    return new AllowRule(methods, conditions, requireAuth, requiredClaims);
  }
}
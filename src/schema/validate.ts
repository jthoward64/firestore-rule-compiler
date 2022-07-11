import { Condition, Field, Match, Schema, AnyOperator, ComparisonOperator, FirestoreType, RuleMethod } from "./schema";

export function validateField(input: unknown): input is Field {
  if (typeof input !== "object") {
    return false;
  }
  const field = input as Field;

  if (typeof field.fieldA !== "string" && typeof field.fieldA !== "object") {
    console.error(`fieldA must be a string or an array of strings`);
    return false;
  } else if (typeof field.fieldA === "object" && !validateField(field.fieldA)) {
    console.error(`fieldA must be a string or an array of strings`);
    return false;
  }
  if (!Object.values(AnyOperator).includes(field.operator)) {
    console.error(`operator must be one of ${Object.values(AnyOperator)}`);
    return false;
  }
  if (typeof field.fieldB !== "string" && typeof field.fieldB !== "object") {
    console.error(`fieldB must be a string or an array of strings`);
    return false;
  } else if (typeof field.fieldB === "object" && !validateField(field.fieldB)) {
    console.error(`fieldB must be a string or an array of strings`);
    return false;
  }

  return true;
}

export function validateCondition(input: unknown): input is Condition {
  if (typeof input !== "object") {
    return false;
  }
  const condition = input as Condition;

  if (typeof condition.fieldA !== "string" && typeof condition.fieldA !== "object") {
    console.error(`fieldA must be a string or an array of strings`);
    return false;
  } else if (typeof condition.fieldA === "object" && !validateField(condition.fieldA)) {
    console.error(`fieldA must be a string or an array of strings`);
    return false;
  }
  if (!Object.values(ComparisonOperator).includes(condition.comparator)) {
    console.error(`comparator must be one of ${Object.values(ComparisonOperator)}`);
    return false;
  }
  if (typeof condition.fieldB !== "string" && typeof condition.fieldB !== "object") {
    console.error(`fieldB must be a string or an array of strings`);
    return false;
  } else if (typeof condition.fieldB === "object" && !validateField(condition.fieldB)) {
    console.error(`fieldB must be a string or an array of strings`);
    return false;
  }
  if (typeof condition.isInverted !== "undefined" && typeof condition.isInverted !== "boolean") {
    console.error(`isInverted must be a boolean`);
    return false;
  }
  if (typeof condition.customOverride !== "undefined" && typeof condition.customOverride !== "string") {
    console.error(`customOverride must be a string`);
    return false;
  }

  return true;
}

export function validateMatch(input: unknown): input is Match {
  if (typeof input !== "object") {
    return false;
  }
  const match = input as Match;

  if (typeof match.collectionPath !== "string") {
    console.error(`collectionPath must be a string`);
    return false;
  }
  if (typeof match.wildcardName !== "string") {
    console.error(`wildcardName must be a string`);
    return false;
  }

  if (match.isWildCardRecursive !== undefined && typeof match.isWildCardRecursive !== "boolean") {
    console.error(`isWildCardRecursive must be a boolean`);
    return false;
  }

  if (match.allowRules !== undefined && !Array.isArray(match.allowRules)) {
    return false;
  } else if (match.allowRules !== undefined) {
    // AllowRule
    for (const allowRule of match.allowRules) {
      // Method
      if (typeof allowRule.methods !== "string" && !Array.isArray(allowRule.methods)) {
        return false;
      } else if (typeof allowRule.methods === "string") {
        if (!Object.values(RuleMethod).includes(allowRule.methods)) {
          console.error(`method must be one of ${Object.values(RuleMethod)}`);
          return false;
        }
      } else {
        for (const method of allowRule.methods) {
          if (!Object.values(RuleMethod).includes(method)) {
            console.error(`method must be one of ${Object.values(RuleMethod)}`);
            return false;
          }
        }
      }

      // Conditions
      if (allowRule.conditions !== undefined && !Array.isArray(allowRule.conditions)) {
        return false;
      } else if (allowRule.conditions !== undefined) {
        for (const condition of allowRule.conditions) {
          if (!(typeof condition === "string" || validateCondition(condition))) {
            console.error(`conditions must be an array of condition objects or strings`);
            return false;
          }
        }
      }
    }
  }
  if (match.structureRules !== undefined && !Array.isArray(match.structureRules)) {
    return false;
  } else if (match.structureRules !== undefined) {
    // StructureRule
    for (const structureRule of match.structureRules) {
      // Field
      if (typeof structureRule.field !== "string" && !Array.isArray(structureRule.field)) {
        console.error(`field must be a string or an array of strings`);
        return false;
      } else if (typeof structureRule.field !== "string") {
        for (const field of structureRule.field) {
          if (!validateField(field)) {
            console.error(`structureRules must be an array of structureRules`);
            return false;
          }
        }
      }

      // FirestoreType
      if (structureRule.type !== undefined) {
        for (const type of structureRule.type) {
          if (!Object.values(FirestoreType).includes(type)) {
            console.error(`type must be an array of ${Object.values(FirestoreType)}`);
            return false;
          }
        }
      }

      if (structureRule.required !== undefined && typeof structureRule.required !== "boolean") {
        console.error(`required must be a boolean`);
        return false;
      }
    }
  }

  if (match.children !== undefined && !Array.isArray(match.children)) {
    return false;
  } else if (match.children !== undefined) {
    for (const child of match.children) {
      if (!validateMatch(child)) {
        console.error(`children must be an array of matches`);
        return false;
      }
    }
  }

  return true;
}

export function validateSchema(input: unknown): input is Schema {
  if (typeof input !== "object") {
    return false;
  }
  const schema = input as Schema;

  if (typeof schema.topLevelMatchPath !== "string") {
    console.error(`topLevelMatchPath must be a string`);
    return false;
  }

  if (schema.matches !== undefined && !Array.isArray(schema.matches)) {
    console.error(`matches must be an array of matches`);
    return false;
  } else if (schema.matches !== undefined) {
    for (const match of schema.matches) {
      if (!validateMatch(match)) {
        console.error(`matches must be an array of matches`);
        return false;
      }
    }
  }

  if (schema.customFunctions !== undefined && !Array.isArray(schema.customFunctions)) {
    console.error(`customFunctions must be an array of customFunctions`);
    return false;
  } else if (schema.customFunctions !== undefined) {
    for (const customFunction of schema.customFunctions) {
      if (typeof customFunction !== "string") {
        console.error(`customFunctions must be an array of strings`);
        return false;
      }
    }
  }

  return true;
}
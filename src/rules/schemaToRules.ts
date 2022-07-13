import prettier from "prettier";

import { AllowRule, Condition, Field, FirestoreType, Match, RuleMethod, Schema, StructureRule } from "../schema/schema";
import { FlatAllowRule, FlatMatch, FlatStructureRule, MergedMatch, Rules } from "./rules";

export function flattenField(field: Field | string | string[]): string {
  if (typeof field === 'string') {
    return field;
  } else if (Array.isArray(field)) {
    let fieldString = "";
    for (let i = 0; i < field.length; i++) {
      if (typeof field[i] === 'string') {
        if (i === 0) {
          fieldString += field[i];
        } else if (field.includes(" ")) {
          fieldString += '["' + field[i] + '"]';
        } else {
          fieldString += '.' + field[i];
        }
      } else {
        fieldString += '[' + field[i] + ']';
      }
    }
    return fieldString;
  } else {
    return `(${field.fieldA}) ${field.operator} (${field.fieldB})`;
  }
}

export function flattenCondition(condition: Condition): string {
  let flatFieldA: string;
  let flatFieldB: string;

  let shouldWrap = false;

  if (typeof condition.fieldA === 'string') {
    flatFieldA = condition.fieldA;
  } else if (Array.isArray(condition.fieldA)) {
    flatFieldA = condition.fieldA.join('.');
  } else {
    flatFieldA = '(' + flattenField(condition.fieldA) + ')';
  }

  if (typeof condition.fieldB === 'string') {
    flatFieldB = condition.fieldB;
  } else if (Array.isArray(condition.fieldB)) {
    flatFieldB = condition.fieldB.join('.');
  } else {
    flatFieldB = '(' + flattenField(condition.fieldB) + ')';
  }

  return `${flatFieldA} ${condition.comparator} ${flatFieldB}`;
}

export function flattenAllowRule(match: AllowRule): FlatAllowRule {
  const flatAllowRule: FlatAllowRule = {
    method: match.methods
  };

  const flatConditions: string[] = [];
  if (Array.isArray(match.conditions) && match.conditions.length > 0) {
    match.conditions.forEach(condition => {
      flatConditions.push(typeof condition === "string" ? condition : flattenCondition(condition));
    });

    flatAllowRule.conditions = flatConditions;
  }

  return flatAllowRule;
}

export function flattenStructureRule(structureRule: StructureRule): FlatStructureRule {
  let field = "";
  if (typeof structureRule.field === 'string') {
    field = structureRule.field;
  } else {
    for (let i = 0; i < structureRule.field.length; i++) {
      if (typeof structureRule.field[i] === 'string') {
        if (i === 0) {
          field += structureRule.field[i];
        } else if (structureRule.field.includes(" ")) {
          field += '["' + structureRule.field[i] + '"]';
        } else {
          field += '.' + structureRule.field[i];
        }
      } else {
        field += '[' + structureRule.field[i] + ']';
      }
    }
  }

  const flatStructureRule: FlatStructureRule = {
    field: flattenField(field),
  };

  if (structureRule.type) {
    flatStructureRule.type = structureRule.type;
  }

  if (structureRule.required) {
    flatStructureRule.required = structureRule.required;
  }

  return flatStructureRule;
}

export function flattenMatch(match: Match): FlatMatch {
  const flatMatch: FlatMatch = {
    collectionPath: match.collectionPath,
    wildcardName: match.wildcardName,
    isStructureExclusive: match.isStructureExclusive,
  };

  if (match.isWildCardRecursive !== undefined) {
    flatMatch.isWildCardRecursive = match.isWildCardRecursive;
  }
  if (match.allowRules !== undefined) {
    flatMatch.allowRules = match.allowRules.map(flattenAllowRule);
  }
  if (match.structureRules !== undefined) {
    flatMatch.structureRules = match.structureRules.map(flattenStructureRule);
  }
  if (match.children !== undefined) {
    flatMatch.children = match.children.map(flattenMatch);
  }

  return flatMatch;
}

export function specifyMatch(match: Match): Match {
  if (match.allowRules) {
    // Convert this and any child matches so that all read or write allow rules are replaced by get/list and create/update/delete respectively
    return {
      ...match,
      allowRules: match.allowRules.flatMap((rule) =>
      ({
        ...rule,
        methods: rule.methods.flatMap((method) => {
          if ((match.children?.length ?? 0) > 0) {
            if (method === RuleMethod.read) {
              return [RuleMethod.get, RuleMethod.list];
            } else if (method === RuleMethod.write) {
              return [RuleMethod.create, RuleMethod.update, RuleMethod.delete];
            } else {
              return [method];
            }
          } else {
            return [method];
          }
        })
      })),
      children: match.children ? match.children.map(specifyMatch) : undefined
    }
  } else {
    return match;
  }
}

function getOptionalTypeCheck(field: string, type: FirestoreType) {
  switch (type) {
    case FirestoreType.string:
      return `getOr(request, '${field}', '')`
    case FirestoreType.number:
    case FirestoreType.int:
    case FirestoreType.float:
      return `getOr(request, '${field}', 0)`
    case FirestoreType.bytes:
      return `getOr(request, '${field}', b'\\x2A')`
    case FirestoreType.bool:
      return `getOr(request, '${field}', false)`
    case FirestoreType.list:
      return `getOr(request, '${field}', [])`
    case FirestoreType.map:
      return `getOr(request, '${field}', {})`
    case FirestoreType.latlng:
      return `getOr(request, '${field}', latlng.value(0,0))`
    case FirestoreType.timestamp:
      return `getOr(request, '${field}', timestamp.date(2000, 1, 1))`
    case FirestoreType.path:
      return `getOr(request, '${field}', path(''))`
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
}

export function mergeMatchRules(flatMatch: FlatMatch): MergedMatch {
  // Add allow rules to a map keyed by method
  const allowRules: Partial<Record<RuleMethod, string>> = {};
  if (flatMatch.allowRules !== undefined) {
    flatMatch.allowRules.forEach(allowRule => {
      if (Array.isArray(allowRule.method)) {
        if (allowRule.conditions?.length === 0 || allowRule.conditions === undefined) {
          allowRule.method.forEach(method => {
            allowRules[method] = "";
          });
        } else {
          allowRule.method.forEach(method => {
            if (allowRules[method] === undefined) {
              allowRules[method] = allowRule.conditions?.join(' && ') ?? '';
            } else {
              allowRules[method] += ' && ' + allowRule.conditions?.join(' && ') ?? '';
            }
          });
        }
      }
    });
  }

  if (flatMatch.structureRules !== undefined) {
    const requiredFields = [];
    for (const structureRule of flatMatch.structureRules) {
      if (structureRule.type !== undefined) {
        if (structureRule.required) {
          requiredFields.push(structureRule.field);
        }

        const creationRule = (structureRule.type.length > 1 ? '(' : '') + structureRule.type.map(type => {
          if (structureRule.required) {
            return `request.resource.data.${structureRule.field} is ${type}`;
          } else {
            return getOptionalTypeCheck(structureRule.field, type) + ' is ' + type;
          }
        }).join(' || ') + (structureRule.type.length > 1 ? ')' : '');

        if (allowRules[RuleMethod.create] === undefined || allowRules[RuleMethod.create] === '') {
          allowRules[RuleMethod.create] = creationRule;
        } else {
          allowRules[RuleMethod.create] += ' && ' + creationRule;
        }

        const updateRule = (structureRule.type.length > 1 ? '(' : '') + structureRule.type.map(type => {
          return getOptionalTypeCheck(structureRule.field, type) + ' is ' + type;
        }).join(' || ') + (structureRule.type.length > 1 ? ')' : '');

        if (allowRules[RuleMethod.update] === undefined || allowRules[RuleMethod.update] === '') {
          allowRules[RuleMethod.update] = updateRule;
        } else {
          allowRules[RuleMethod.update] += ' && ' + updateRule;
        }
      } else {
        if (structureRule.required) {
          requiredFields.push(structureRule.field);
        }
      }
    }
    if (allowRules[RuleMethod.create] === undefined) {
      allowRules[RuleMethod.create] = `request.resource.data.keys().has${flatMatch.isStructureExclusive ? "Only" : "All"}([${requiredFields.map((field => `'${field}'`)).join(', ')}])`;
    } else {
      allowRules[RuleMethod.create] += ' && ' + `request.resource.data.keys().has${flatMatch.isStructureExclusive ? "Only" : "All"}([${requiredFields.map((field => `'${field}'`)).join(', ')}])`;
    }
  }

  return {
    collectionPath: flatMatch.collectionPath,
    wildcardName: flatMatch.wildcardName,
    isWildCardRecursive: flatMatch.isWildCardRecursive,
    rules: Object.entries(allowRules)
      .map(
        ([method, conditions]) =>
          conditions === ""
            ? `allow ${method};`
            : `allow ${method}: if ${conditions};`
      ),
    children: flatMatch.children ? flatMatch.children.map(mergeMatchRules) : undefined
  };
};

export default function (schema: Schema): Rules {
  const rules: Rules = {
    topLevelMatchPath: schema.topLevelMatchPath,
  };

  if (Array.isArray(schema.matches)) {
    const matches: FlatMatch[] = [];
    for (const match of schema.matches) {
      matches.push(flattenMatch(specifyMatch(match)));
    }
    rules.matches = matches.map(mergeMatchRules);
  }

  if (Array.isArray(schema.customFunctions)) {
    rules.customFunctions = schema.customFunctions.map(customFunction => prettier.format(customFunction, { parser: "babel", endOfLine: "lf" }).replace(/\n/g, "\n    "));
  }

  return rules;
}

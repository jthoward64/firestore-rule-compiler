import { match } from "assert";
import { ExpandedMatch, FlatMatch } from "../mustache/rules";
import { failWithMessage } from "../util";
import { AllowRule } from "./AllowRule";
import { FirestoreType, RuleMethod } from "./enums";
import { StructureRule } from "./StructureRule";

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
      failWithMessage(`Unsupported type: ${type}`);
  }
}

export class Match {
  /**
   * The slash separated path to the field, e.g. "collection/document/sub-collection", no leading or trailing slashes
   */
  collectionPath: string;
  /**
   * The name of the document at the end of the collection, i.e. "uid"
   */
  wildcardName: string;
  /**
   * Should the wildcard be followed by "=**", allows the document to be located in a subcolleciton
   */
  isWildCardRecursive?: boolean;
  /**
   * The logical rules to apply to the field
   */
  allowRules?: AllowRule[];
  /**
   * The type-based rules to apply to the field
   */
  structureRules?: StructureRule[];
  /**
   * Should any fields not specified in the structure be disallowed?
   */
  isStructureExclusive?: boolean;
  /**
   * Child thises
   */
  children?: Match[];

  constructor(collectionPath: string, wildcardName: string, isWildCardRecursive?: boolean, allowRules?: AllowRule[], structureRules?: StructureRule[], isStructureExclusive?: boolean, children?: Match[]) {
    this.collectionPath = collectionPath;
    this.wildcardName = wildcardName;
    this.isWildCardRecursive = isWildCardRecursive;
    this.allowRules = allowRules;
    this.structureRules = structureRules;
    this.isStructureExclusive = isStructureExclusive;
    this.children = children;
  }

  specify(): Match {
    if (this.allowRules) {
      // Convert this and any child matches so that all read or write allow rules are replaced by get/list and create/update/delete respectively
      const allowRules = this.allowRules.flatMap((rule) => new AllowRule(
        rule.methods.flatMap((method) => {
          if ((this.children?.length ?? 0) > 0) {
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
        }),
        rule.conditions,
        rule.requireAuth,
        rule.requiredClaims
      ));
      const children = this.children ? this.children.map((child) => child.specify()) : undefined

      return new Match(this.collectionPath, this.wildcardName, this.isWildCardRecursive, allowRules, this.structureRules, this.isStructureExclusive, children);
    } else {
      return this;
    }
  }

  flatten(): FlatMatch {
    const flatMatch: FlatMatch = {
      collectionPath: this.collectionPath,
      wildcardName: this.wildcardName,
      isStructureExclusive: this.isStructureExclusive,
    };

    if (this.isWildCardRecursive != undefined) {
      flatMatch.isWildCardRecursive = this.isWildCardRecursive;
    }
    if (this.allowRules != undefined) {
      flatMatch.allowRules = this.allowRules.map((allowRule) => allowRule.flatten());
    }
    if (this.structureRules != undefined) {
      flatMatch.structureRules = this.structureRules.map((structureRule) => structureRule.flatten());
    }
    if (this.children != undefined) {
      flatMatch.children = this.children.map((child) => child.flatten());
    }

    return flatMatch;
  }

  static fromJson(json: any): Match {
    const { collectionPath, wildcardName, isWildCardRecursive, allowRules, structureRules, isStructureExclusive, children } = json;

    if (collectionPath == null || wildcardName == null) {
      failWithMessage("collectionPath and wildcardName are required on Match:\n" + JSON.stringify(json, null, 2));
    }

    if (typeof collectionPath !== "string") {
      failWithMessage("collectionPath must be a string on Match:\n" + JSON.stringify(json, null, 2));
    }

    if (typeof wildcardName !== "string") {
      failWithMessage("wildcardName must be a string on Match:\n" + JSON.stringify(json, null, 2));
    }

    if (isWildCardRecursive != undefined && typeof isWildCardRecursive !== "boolean") {
      failWithMessage("isWildCardRecursive must be a boolean on Match:\n" + JSON.stringify(json, null, 2));
    }

    if (allowRules != undefined && !Array.isArray(allowRules)) {
      failWithMessage("allowRules must be an array on Match:\n" + JSON.stringify(json, null, 2));
    }

    if (structureRules != undefined && !Array.isArray(structureRules)) {
      failWithMessage("structureRules must be an array on Match:\n" + JSON.stringify(json, null, 2));
    }

    if (isStructureExclusive != undefined && typeof isStructureExclusive !== "boolean") {
      failWithMessage("isStructureExclusive must be a boolean on Match:\n" + JSON.stringify(json, null, 2));
    }

    if (children != undefined && (!Array.isArray(children) || children.length < 1)) {
      failWithMessage("children must be an array on Match:\n" + JSON.stringify(json, null, 2));
    }

    return new Match(collectionPath, wildcardName, isWildCardRecursive, allowRules == null ? allowRules : allowRules.map((rule: any) => AllowRule.fromJson(rule)), structureRules == null ? undefined : structureRules.map((rule: any) => StructureRule.fromJson(rule)), isStructureExclusive, children == null ? undefined : children.map((child: any) => Match.fromJson(child)));
  }

  static expandFlatMatch(flatMatch: FlatMatch): ExpandedMatch {
    // Add allow rules to a map keyed by method
    const allowRules: Partial<Record<RuleMethod, string>> = {};
    if (flatMatch.allowRules != undefined) {
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

    if (flatMatch.structureRules != undefined) {
      const requiredFields = [];
      for (const structureRule of flatMatch.structureRules) {
        if (structureRule.type != undefined) {
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
      children: flatMatch.children ? flatMatch.children.map((child) => Match.expandFlatMatch(child)) : undefined
    };
  }
}
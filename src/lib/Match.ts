import { ExpandedMatch, FlatMatch } from "../mustache/rules";
import { failWithMessage } from "../util";
import { AllowRule, AllowRuleObj } from "./AllowRule";
import { FirestoreType, RuleMethod } from "./enums";
import { StructureRule, StructureRuleObj } from "./StructureRule";

export interface MatchObj {
  collectionPath: string;
  documentName: string;
  isWildCard?: boolean;
  isWildCardRecursive?: boolean;
  allowRules?: AllowRuleObj[];
  structureRules?: StructureRuleObj[];
  isStructureExclusive?: boolean;
  isAllowExclusive?: boolean;
  children?: MatchObj[];
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
  documentName: string;
  /**
   * Should the document be interpreted as a wildcard?
   */
  isWildCard?: boolean;
  /**
   * Should the wildcard be followed by "=**", allows the document to be located in a subcolleciton, has no effect if isWildCard is false
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

  constructor(collectionPath: string, documentName: string, isWildCard?: boolean, isWildCardRecursive?: boolean, allowRules?: AllowRule[], structureRules?: StructureRule[], isStructureExclusive?: boolean, children?: Match[]) {
    this.collectionPath = collectionPath;
    this.documentName = documentName;
    this.isWildCard = isWildCard;
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

      return new Match(this.collectionPath, this.documentName, this.isWildCardRecursive, this.isWildCard, allowRules, this.structureRules, this.isStructureExclusive, children);
    } else {
      return this;
    }
  }

  flatten(): FlatMatch {
    const flatMatch: FlatMatch = {
      collectionPath: this.collectionPath,
      documentName: this.documentName,
      isStructureExclusive: this.isStructureExclusive,
    };

    if (this.isWildCardRecursive != undefined) {
      flatMatch.isWildCardRecursive = this.isWildCardRecursive;
    }
    if (this.isWildCard != undefined) {
      flatMatch.isWildCard = this.isWildCard;
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

  static fromJson(json: MatchObj): Match {
    return new Match(json.collectionPath, json.documentName, json.isWildCard, json.isWildCardRecursive, json.allowRules == null ? json.allowRules : json.allowRules.map((rule: any) => AllowRule.fromJson(rule)), json.structureRules == null ? undefined : json.structureRules.map((rule: any) => StructureRule.fromJson(rule)), json.isStructureExclusive, json.children == null ? undefined : json.children.map((child: any) => Match.fromJson(child)));
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
      documentName: flatMatch.documentName,
      isWildCard: flatMatch.isWildCard,
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
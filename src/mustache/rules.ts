import { FirestoreType, RuleMethod } from "../lib/enums";

export interface FlatAllowRule {
  method: RuleMethod[];
  conditions?: string[];
}

export interface FlatStructureRule {
  field: string;
  type?: FirestoreType[];
  required?: boolean;
}

export interface FlatMatch {
  collectionPath: string;
  documentName: string;
  isWildCardRecursive?: boolean;
  isWildCard?: boolean;
  allowRules?: FlatAllowRule[];
  structureRules?: FlatStructureRule[];
  isStructureExclusive?: boolean;
  children?: FlatMatch[];
}

export interface ExpandedMatch {
  collectionPath: string;
  documentName: string;
  isWildCardRecursive?: boolean;
  isWildCard?: boolean;
  rules: string[];
  children?: ExpandedMatch[];
}

export interface Rules {
  topLevelMatchPath: string;
  matches?: ExpandedMatch[];
  customFunctions?: string[];
}

import { FirestoreType, RuleMethod } from "../schema/schema";

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
  wildcardName: string;
  isWildCardRecursive?: boolean;
  allowRules?: FlatAllowRule[];
  structureRules?: FlatStructureRule[];
  isStructureExclusive?: boolean;
  children?: FlatMatch[];
}

export interface MergedMatch {
  collectionPath: string;
  wildcardName: string;
  isWildCardRecursive?: boolean;
  rules: string[];
  children?: MergedMatch[];
}

export interface Rules {
  topLevelMatchPath: string;
  matches?: MergedMatch[];
  customFunctions?: string[];
}

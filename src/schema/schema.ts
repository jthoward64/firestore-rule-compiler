export enum RuleMethod {
  read = "read",
  write = "write",
  get = "get",
  list = "list",
  create = "create",
  update = "update",
  delete = "delete"
};

export enum ComparisonOperator {
  "<" = "<",
  "<=" = "<=",
  "==" = "==",
  "!=" = "!=",
  ">=" = ">=",
  ">" = ">",
  "in" = "in",
  "is" = "is"
};

export enum ArithmeticOperator {
  "+" = "+",
  "-" = "-",
  "&" = "*",
  "/" = "/",
  "%" = "%"
};

export enum LogicalOperator {
  "&&" = "&&",
  "||" = "||"
};

export enum AnyOperator {
  "<" = "<",
  "<=" = "<=",
  "==" = "==",
  "!=" = "!=",
  ">=" = ">=",
  ">" = ">",
  "in" = "in",
  "is" = "is",
  "+" = "+",
  "-" = "-",
  "*" = "*",
  "/" = "/",
  "%" = "%",
  "&&" = "&&",
  "||" = "||"
};

export enum FirestoreType {
  "bool" = "bool",
  "bytes" = "bytes",
  "float" = "float",
  "int" = "int",
  "list" = "list",
  "latlng" = "latlng",
  "number" = "number",
  "path" = "path",
  "map" = "map",
  "string" = "string",
  "timestamp" = "timestamp"
}

export interface Field {
  /**
   * The lefthand field to compare, can be a field object, a literal field, or an array of string to be joined by "."
   */
  fieldA: Field | string | string[];
  /**
   * The comparator to put between the two fields
   */
  operator: AnyOperator;
  /**
   * The righthand field to compare, can be a field object, a literal field, or an array of string to be joined by "."
   */
  fieldB: Field | string | string[];
};

export interface Condition {
  /**
   * The lefthand field to compare, can be a field object, a literal field, or an array of string to be joined by "."
   */
  fieldA: Field | string | string[];
  /**
   * The comparator to put between the two fields
   */
  comparator: ComparisonOperator;
  /**
   * The righthand field to compare, can be a field object, a literal field, or an array of string to be joined by "."
   */
  fieldB: Field | string | string[];
  /**
   * Should the expression be preceded by "!"
   */
  isInverted?: boolean;
  /**
   * If provided, the other options will be ignored and this string will be used literally
   */
  customOverride?: string;
}

export interface AllowRule {
  /**
   * The methods to allow if the conditions are met
   */
  methods: RuleMethod[];
  /**
   * A list of conditions that must be met for the rule to be allowed, joined by "&&"
   */
  conditions?: (Condition | string)[];
}

export interface StructureRule {
  /**
   * The name of the field to check, if an array it will be joined by ".", unless the field is a number in which case it will use "[x]"
   */
  field: string | (string | number)[];
  /**
   * The allowed types for the field
   * If type is not specified, just make sure the field exists and ignore type (results in no effect to update)
   */
  type?: FirestoreType[];
  /**
   * Is the field required?
   */
  required?: boolean;
}

export interface Match {
  /**
   * The slash separated path to the field, e.g. "users/{uid}", no leading or trailing slashes
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
   * Child matches
   */
  children?: Match[];
}

export interface Schema {
  /**
   * The top level match parameter (i.e. /databases/{database}/documents)
   */
  topLevelMatchPath: string;
  /**
   * An array of matches to place in the rules
   */
  matches?: Match[];
  /**
   * An array of functions (strings) to place at the bottom of the rules, prettified automatically, though no syntax checking is performed
   */
  customFunctions?: string[];
}
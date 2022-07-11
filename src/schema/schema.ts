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
  fieldA: Field | string | string[];
  operator: AnyOperator;
  fieldB: Field | string | string[];
};

export interface Condition {
  fieldA: Field | string | string[];
  comparator: ComparisonOperator;
  fieldB: Field | string | string[];
  isInverted?: boolean;
  customOverride?: string;
}

export interface AllowRule {
  methods: RuleMethod[];
  conditions?: (Condition | string)[];
}

export interface StructureRule {
  field: string | (string | number)[];
  type?: FirestoreType[]; // If type is not specified, just make sure the field exists and ignore type (results in no effect to update)
  required?: boolean;
}

export interface Match {
  collectionPath: string;
  wildcardName: string;
  isWildCardRecursive?: boolean;
  allowRules?: AllowRule[];
  structureRules?: StructureRule[];
  isStructureExclusive?: boolean;
  children?: Match[];
}

export interface Schema {
  topLevelMatchPath: string;
  matches?: Match[];
  customFunctions?: string[];
}
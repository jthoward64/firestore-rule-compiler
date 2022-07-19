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

export enum LogicalOperator {
  "&&" = "&&",
  "||" = "||"
};

export enum BooleanOperator {
  "<" = "<",
  "<=" = "<=",
  "==" = "==",
  "!=" = "!=",
  ">=" = ">=",
  ">" = ">",
  "in" = "in",
  "is" = "is",
  "&&" = "&&",
  "||" = "||"
}

export enum ArithmeticOperator {
  "+" = "+",
  "-" = "-",
  "&" = "*",
  "/" = "/",
  "%" = "%"
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

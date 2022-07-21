import { JSONSchemaType } from "ajv"
import { AnyOperator, BooleanOperator, FirestoreType, RuleMethod } from "./enums";
import { ModelObj } from "./Model"

// @ts-expect-error
export const schema: JSONSchemaType<ModelObj> = import("./schema.json")

// @ts-expect-error
export const defsSchema: JSONSchemaType<never> = import("./defs.json");

import { JSONSchemaType } from "ajv"
import { AnyOperator, BooleanOperator, FirestoreType, RuleMethod } from "./enums";
import { ModelObj } from "./Model"
import untypedSchema from "./model.schema.json";
import untypedDefsSchema from "./defs.schema.json";

// @ts-expect-error
export const schema: JSONSchemaType<ModelObj> = untypedSchema;

// @ts-expect-error
export const defsSchema: JSONSchemaType<never> = untypedDefsSchema;

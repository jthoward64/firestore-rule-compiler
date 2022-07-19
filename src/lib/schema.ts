import { JSONSchemaType } from "ajv"
import { AnyOperator, BooleanOperator, FirestoreType, RuleMethod } from "./enums";
import { ModelObj } from "./Model"

//@ts-expect-error TODO fix
export const schema: JSONSchemaType<ModelObj> = {
  $id: "http://example.com/schemas/schema.json",
  type: "object",
  properties: {
    topLevelMatchPath: {
      type: "string"
    },
    matches: {
      type: "array",
      items: {
        $ref: "defs.json#/definitions/match"
      },
      nullable: true,
    },
    customFunctions: {
      type: "array",
      items: {
        type: "string",
      },
      nullable: true,
    }
  },
  required: ["topLevelMatchPath"],
}

export const defsSchema: JSONSchemaType<never> = {
  $id: "http://example.com/schemas/defs.json",
  definitions: {
    //@ts-expect-error TODO fix
    match: {
      type: "object",
      properties: {
        collectionPath: {
          type: "string",
        },
        documentName: {
          type: "string",
        },
        isWildCard: {
          type: "boolean",
          default: false,
          nullable: true,
        },
        isWildCardRecursive: {
          type: "boolean",
          default: false,
          nullable: true,
        },
        allowRules: {
          type: "array",
          items: {
            $ref: "#/definitions/allowRule"
          },
          nullable: true,
        },
        structureRules: {
          type: "array",
          items: {
            $ref: "#/definitions/structureRule"
          },
        },
        isStructureExclusive: {
          type: "boolean",
          default: false,
          nullable: true,
        },
        isAllowExclusive: {
          type: "boolean",
          default: false,
          nullable: true,
        },
        children: {
          type: "array",
          items: {
            type: "object",
            $ref: "#",
          },
          nullable: true,
        }
      },
      required: ["collectionPath", "documentName"],
    },
    structureRule: {
      type: "object",
      required: ["field", "type"],
      properties: {
        field: {
          type: "string"
        },
        type: {
          type: "array",
          items: {
            type: "string",
            enum: Object.keys(FirestoreType) as FirestoreType[],
          }
        },
        required: {
          type: "boolean",
          nullable: true,
        }
      }
    },
    //@ts-expect-error TODO fix
    allowRule: {
      type: "object",
      required: ["methods"],
      properties: {
        methods: {
          type: "array",
          items: {
            type: "string",
            enum: Object.keys(RuleMethod) as RuleMethod[],
          }
        },
        conditions: {
          type: "array",
          items: {
            type: ["string", "object"],
            oneOf: [
              {
                type: "string",
              },
              {
                $ref: "#/definitions/condition",
              }
            ]
          },
          nullable: true,
        },
        requireAuth: {
          type: "boolean",
          nullable: true,
        },
        requiredClaims: {
          type: "array",
          items: {
            type: "object",
            required: ["name"],
            properties: {
              name: {
                type: "string",
              },
              value: {
                type: ["string", "number", "boolean"],
                nullable: true,
                oneOf: [
                  {
                    type: "string",
                  },
                  {
                    type: "number",
                  },
                  {
                    type: "boolean",
                  }
                ]
              }
            }
          },
          nullable: true,
        }
      }
    },
    //@ts-expect-error TODO fix
    condition: {
      type: "object",
      properties: {
        fieldA: {
          type: ["string", "object"],
          oneOf: [
            {
              type: "string",
            },
            {
              $ref: "#/definitions/field",
            }
          ]
        },
        comparator: {
          type: "string",
          enum: Object.keys(BooleanOperator) as (keyof BooleanOperator)[],
        },
        fieldB: {
          type: ["string", "object"],
          oneOf: [
            {
              type: "string",
            },
            {
              $ref: "#/definitions/field",
            }
          ]
        },
        isInverted: {
          type: "boolean",
          default: false,
          nullable: true,
        },
        customOverride: {
          type: "string",
          nullable: true,
        },
      },
      required: ["fieldA", "comparator", "fieldB"],
    },
    //@ts-expect-error TODO fix
    field: {
      type: "object",
      properties: {
        fieldA: {
          type: ["string", "object"],
          oneOf: [
            {
              type: "string",
            },
            {
              $ref: "#/definitions/field",
            }
          ]
        },
        comparator: {
          type: "string",
          enum: Object.keys(AnyOperator) as (keyof AnyOperator)[],
        },
        fieldB: {
          type: ["string", "object"],
          oneOf: [
            {
              type: "string",
            },
            {
              $ref: "#/definitions/field",
            }
          ]
        },
      },
      required: ["fieldA", "comparator", "fieldB"],
    }
  }
};
import Ajv from "ajv";
import { schema, defsSchema } from "../../src/lib/schema";

describe("Ajv schema", () => {
  it("should be valid", () => {
    const ajv = new Ajv({
      allowUnionTypes: true,
      verbose: globalThis.debugMode,
      logger: globalThis.debugMode ? { error: console.error, warn: console.warn, log: console.log } : undefined,
    });

    expect(ajv.validateSchema(schema, true)).toBe(true);
  });
});

describe("Ajv defs schema", () => {
  it("should be valid", () => {
    const ajv = new Ajv({
      allowUnionTypes: true,
      verbose: globalThis.debugMode,
      logger: globalThis.debugMode ? { error: console.error, warn: console.warn, log: console.log } : undefined,
    });

    expect(ajv.validateSchema(defsSchema, true)).toBe(true);
  });
});

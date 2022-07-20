import { AnyOperator } from "../../src/lib/enums";
import { Field, FieldObj } from "../../src/lib/Field";

describe("Field", () => {
  it("should parse a field object", () => {
    const fieldObj: FieldObj = {
      fieldA: "fieldA",
      comparator: AnyOperator["=="],
      fieldB: "fieldB"
    };
    const field = new Field("fieldA", AnyOperator["=="], "fieldB");
    expect(field).toStrictEqual(Field.fromJson(fieldObj));
  });

  it("should be able to flatten a field", () => {
    const field = new Field("fieldA", AnyOperator["=="], "fieldB");
    expect(field.flatten()).toBe("fieldA == fieldB");
  });
});
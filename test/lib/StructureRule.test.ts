import { FirestoreType } from "../../src/lib/enums";
import { StructureRule } from "../../src/lib/StructureRule";

describe("StructureRule", () => {
  it("should parse a field object", () => {
    const ruleFromJson = StructureRule.fromJson({
      field: "field",
      type: [FirestoreType.string],
      required: true,
    });

    const rule = new StructureRule("field", [FirestoreType.string], true);

    expect(ruleFromJson).toStrictEqual(rule);
  });
});
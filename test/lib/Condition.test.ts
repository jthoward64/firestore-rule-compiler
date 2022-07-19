import { Condition, ConditionObj } from "../../src/lib/Condition";
import { BooleanOperator } from "../../src/lib/enums";

describe("Condition", () => {
  it("should create an instance", () => {
    expect(new Condition("A", BooleanOperator["=="], "B")).toBeTruthy();
  });

  it("should come from JSON correctly", () => {
    const conditionJson: ConditionObj = {
      fieldA: "A",
      comparator: BooleanOperator["=="],
      fieldB: "B",
      isInverted: true
    };
    const conditionFromJson = Condition.fromJson(conditionJson);

    const condition = new Condition("A", BooleanOperator["=="], "B", true);

    expect(conditionFromJson).toStrictEqual(condition);
  });

  it("should flatten correctly", () => {
    const condition = new Condition("A", BooleanOperator["=="], "B");
    expect(condition.flatten()).toBe("A == B");

    const invertedCondition = new Condition("A", BooleanOperator["=="], "B", true);
    expect(invertedCondition.flatten()).toBe("!(A == B)");
  });
});

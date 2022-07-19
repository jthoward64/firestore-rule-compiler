import { AllowRule, AllowRuleObj } from "../../src/lib/AllowRule";
import { Condition } from "../../src/lib/Condition";
import { BooleanOperator, RuleMethod } from "../../src/lib/enums";

describe("AllowRule", () => {
  it("should create an instance", () => {
    expect(new AllowRule([])).toBeTruthy();
  });

  it("should come from JSON correctly", () => {
    const allowRuleJson: AllowRuleObj = {
      methods: [RuleMethod.get],
      conditions: [
        "A String",
        {
          fieldA: "A",
          comparator: BooleanOperator["=="],
          fieldB: "B",
          isInverted: true
        }
      ],
      requireAuth: true,
      requiredClaims: [
        {
          name: "ClaimA",
          value: "ValueA"
        },
        {
          name: "ClaimB"
        }
      ]
    }
    const allowRuleFromJson = AllowRule.fromJson(allowRuleJson);

    const allowRule = new AllowRule(
      [RuleMethod.get],
      [
        "A String",
        new Condition(
          "A",
          BooleanOperator["=="],
          "B",
          true
        )
      ],
      true,
      [
        {
          name: "ClaimA",
          value: "ValueA"
        },
        {
          name: "ClaimB"
        }
      ]
    );

    expect(allowRuleFromJson).toStrictEqual(allowRule);
  });

  it("should flatten correctly", () => {
    const allowRule = new AllowRule(
      [RuleMethod.get],
      [
        "A String",
        new Condition(
          "A",
          BooleanOperator["=="],
          "B",
          true
        )
      ],
      true,
      [
        {
          name: "ClaimA",
          value: "ValueA"
        },
        {
          name: "ClaimB"
        }
      ]
    );

    const flatAllowRule = allowRule.flatten();

    console.log(flatAllowRule);

    expect(flatAllowRule).toStrictEqual({
      method: ['get'],
      conditions: [
        "A String",
        "!(A == B)",
        "request.auth != null",
        "request.auth.token.ClaimA == ValueA",
        "request.auth.token.ClaimB != null"
      ]
    });
  });
});
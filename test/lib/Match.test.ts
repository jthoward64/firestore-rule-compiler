import { FirestoreType } from "../../src/lib/enums";
import { getOptionalTypeCheck, Match } from "../../src/lib/Match"

describe("Match", () => {
  it("should parse from JSON", () => {
    const matchFromJson = Match.fromJson({
      collectionPath: "test",
      documentName: "test",
      isWildCard: true,
      isWildCardRecursive: true,
      allowRules: [],
      structureRules: [],
      isStructureExclusive: true,
      children: [
        {
          collectionPath: "test",
          documentName: "test",
          isWildCard: true,
          isWildCardRecursive: true,
          allowRules: [],
          structureRules: [],
          isStructureExclusive: true,
        },
      ],
    });

    const match = new Match("test", "test", true, true, [], [], true, [
      new Match("test", "test", true, true, [], [], true, []),
    ]);
  });

  it("should flatten", () => {
    const match = new Match("test", "test", true, true, [], [], true, [
      new Match("test", "test", true, true, [], [], true, []),
    ]);

    const flatMatch = match.flatten();

    expect(flatMatch).toEqual({
      collectionPath: "test",
      documentName: "test",
      allowRules: [],
      structureRules: [],
      isStructureExclusive: true,
      isWildCard: true,
      isWildCardRecursive: true,
      children: [
        {
          collectionPath: "test",
          documentName: "test",
          allowRules: [],
          structureRules: [],
          isStructureExclusive: true,
          isWildCard: true,
          isWildCardRecursive: true,
          children: [],
        },
      ],
    });
  });

  describe(getOptionalTypeCheck, () => {
    it("should return something for all valid Firestore types", () => {
      for (const type of Object.values(FirestoreType)) {
        expect(getOptionalTypeCheck("test", type)).toBeTruthy();
      }
    });

    it("should crash for invalid Firestore types", () => {
      const realProcess = process;
      const exitMock = jest.fn<never, [number | undefined]>();
      global.process = { ...realProcess, exit: exitMock };

      // @ts-expect-error
      getOptionalTypeCheck("test", "invalid");

      expect(exitMock).toHaveBeenCalledWith(1);
      global.process = realProcess;
    });
  });
});
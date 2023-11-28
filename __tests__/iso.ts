import { iso } from "@optics";

describe("Iso", () => {
  describe("double iso", () => {
    const doubleIso = iso.makeIso<number, number>((n) => n * 2)((n) => n / 2);

    it("double 2 to 4", () => {
      expect(doubleIso.get(2)).toEqual(4);
    });

    it("double reverse 4 to 2", () => {
      expect(doubleIso.reverseGet(4)).toEqual(2);
    });

    it("roundTripOneWay with 2", () => {
      expect(doubleIso.reverseGet(doubleIso.get(2))).toEqual(2);
    });

    it("roundTripOtherWay with 2", () => {
      expect(doubleIso.get(doubleIso.reverseGet(2))).toEqual(2);
    });
  });

  describe("makeInt iso", () => {
    const makeInt = iso.makeIso<string, number>(parseInt)(String);

    it("An alphabet string", () => {
      expect(makeInt.get("hello")).toEqual(NaN);
    });

    it("roundTripOneWay with 2", () => {
      expect(makeInt.reverseGet(makeInt.get("2"))).toEqual("2");
    });

    it("roundTripOtherWay with 2", () => {
      expect(makeInt.get(makeInt.reverseGet(2))).toEqual(2);
    });

    it("roundTripOneWay with NaN", () => {
      expect(makeInt.reverseGet(makeInt.get("NaN"))).toEqual("NaN");
    });

    it("roundTripOtherWay with NaN", () => {
      expect(makeInt.get(makeInt.reverseGet(NaN))).toEqual(NaN);
    });
  });
});

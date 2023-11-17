import assert from "node:assert";
import test, { describe } from "node:test";

import { iso } from "@optics";

describe("Iso", () => {
  describe("double iso", () => {
    const doubleIso = iso<number, number>(
      (n) => n * 2,
      (n) => n / 2
    );

    test("double 2 to 4", () => {
      assert.strictEqual(doubleIso.get(2), 4);
    });

    test("double reverse 4 to 2", () => {
      assert.strictEqual(doubleIso.reverseGet(4), 2);
    });

    test("roundTripOneWay with 2", () => {
      assert.strictEqual(doubleIso.reverseGet(doubleIso.get(2)), 2);
    });

    test("roundTripOtherWay with 2", () => {
      assert.strictEqual(doubleIso.get(doubleIso.reverseGet(2)), 2);
    });
  });

  describe("makeInt iso", () => {
    const makeInt = iso<string, number>(parseInt, String);

    test("roundTripOneWay with 2", () => {
      assert.strictEqual(makeInt.reverseGet(makeInt.get("2")), "2");
    });

    test("roundTripOtherWay with 2", () => {
      assert.strictEqual(makeInt.get(makeInt.reverseGet(2)), 2);
    });

    test("roundTripOneWay with NaN", () => {
      assert.strictEqual(makeInt.reverseGet(makeInt.get("NaN")), "NaN");
    });

    test("roundTripOtherWay with NaN", () => {
      assert.strictEqual(makeInt.get(makeInt.reverseGet(NaN)), NaN);
    });

    test("An alphabet string", () => {
      assert.strictEqual(makeInt.get("hello"), NaN);
    });
  });
});

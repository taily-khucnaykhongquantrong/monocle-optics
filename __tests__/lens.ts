import { lens } from "@optics";

describe("Lens", () => {
  describe("Address with Street Name Lens", () => {
    const address = {
      streetNumber: 1,
      streetName: "Ab",
    };
    const streetNameLens = lens<typeof address, "streetName">("streetName");
    const streetNameToList = (streetName: string): [string, string] => [
      `${streetName}1`,
      `${streetName}2`,
    ];
    const streetNameFunctor =
      (f: typeof streetNameToList) => (a: typeof address) => {
        const [streetName1, streetName2] = f(a.streetName);
        return [
          { ...a, streetName: streetName1 },
          { ...a, streetName: streetName2 },
        ] as [typeof address, typeof address];
      };

    it("Get street name, value is Ab", () => {
      expect(streetNameLens.get(address)).toBe("Ab");
    });

    it("Get street name, value is address.streetName", () => {
      expect(streetNameLens.get(address)).toBe(address.streetName);
    });

    it("Replace street name, value is Ac", () => {
      expect(streetNameLens.replace("Ac")(address)).toMatchObject({
        ...address,
        streetName: "Ac",
      });
    });

    it("Modify street name, value is Abdress", () => {
      expect(
        streetNameLens.modify((value) => `${value}dress`)(address)
      ).toMatchObject({ ...address, streetName: "Abdress" });
    });

    it("Modify street name with Functor, value is list of 2 new address", () => {
      expect(
        streetNameLens.modifyF(streetNameToList)(streetNameFunctor)(address)
      );
    });
  });

  describe("Address with Street number Lens", () => {
    const address = {
      streetNumber: 1,
      streetName: "Ab",
    };
    const streetNumberLens = lens<typeof address, "streetNumber">(
      "streetNumber"
    );
    const streetNameToList = (streetName: string): [string, string] => [
      `${streetName}1`,
      `${streetName}2`,
    ];
    const streetNameFunctor =
      (f: typeof streetNameToList) => (a: typeof address) => {
        const [streetName1, streetName2] = f(a.streetName);
        return [
          { ...a, streetName: streetName1 },
          { ...a, streetName: streetName2 },
        ] as [typeof address, typeof address];
      };
  });
});

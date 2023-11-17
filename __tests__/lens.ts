import { lens } from "@optics";

describe("Lens", () => {
  describe("Address Lens", () => {
    const address = {
      streetNumber: 1,
      streetName: "Ab",
    };
    const streetNameLens = lens<typeof address, string>("streetName");

    it("get street name, value is 1", () => {
      expect(streetNameLens.get(address)).toBe("Ab");
    });
  });
});

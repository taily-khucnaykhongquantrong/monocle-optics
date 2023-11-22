import { lens } from "@optics";
import { type Map } from "@optics/utils";

describe("Lens", () => {
  type Person = {
    name: string;
    age: number;
    address?: Address;
  };
  type Address = {
    streetNumber: number;
    streetName: string;
  };

  describe("Array of number Lens", () => {
    const arr = new Array(3).fill(0).map((_, index) => index + 1);
    const arrOf5thLens = lens<typeof arr, number>(4);

    it("Get 5th element", () => {
      expect(arrOf5thLens.get(arr)).toBeUndefined();
    });

    it("Get 2nd element", () => {
      const arrOf2ndLens = lens<typeof arr, number>(2);
      expect(arrOf2ndLens.get(arr)).toBe(3);
    });

    it("Replace 5th element with 5", () => {
      expect(arrOf5thLens.replace(5)(arr)).toMatchObject([
        1,
        2,
        3,
        undefined,
        5,
      ]);
    });

    it("Modify 5th element with undefined + 5", () => {
      expect(arrOf5thLens.modify((n) => n + 5)(arr)).toMatchObject([
        1,
        2,
        3,
        undefined,
        NaN,
      ]);
    });

    it("Modify 5th element with String converter", () => {
      const numberToStringFunctor =
        (f: Map<number, string>) =>
        (a: typeof arr, key: number): Array<string | number> => {
          if (key <= a.length) {
            return a.map((value, index) => (index === key ? f(value) : value));
          }

          Object.assign(a, { [key]: f(a[key]) });
          return a;
        };

      expect(
        arrOf5thLens.modifyF(String)(numberToStringFunctor)(arr)
      ).toMatchObject([1, 2, 3, undefined, "undefined"]);
    });
  });

  describe("Promise of object Lens", () => {
    const person: Person = { name: "Tai", age: 27 };
    const ageLens = lens<Person, number>("age");

    it("Update age with Promise lens", async () => {
      const updateAge = async (age: number) =>
        new Promise<number>((resolve) => {
          resolve(age + 1);
        });
      const updateAgeFunctor =
        (f: typeof updateAge) =>
        async (p: Person, key: string): Promise<Person> => {
          const newAge = await f(p[key as "age"]);

          return { ...p, age: newAge };
        };

      await expect(
        ageLens.modifyF<Promise<number>, Promise<Person>>(updateAge)(
          updateAgeFunctor
        )(person)
      ).resolves.toMatchObject({ ...person, age: person.age + 1 });
    });
  });

  describe("Address with Street Name Lens", () => {
    const address = {
      streetNumber: 1,
      streetName: "Ab",
    };
    const streetNameLens = lens<Address, string>("streetName");
    const streetNameToList = (streetName: string): [string, string] => [
      `${streetName}1`,
      `${streetName}2`,
    ];
    const streetNameFunctor =
      (f: typeof streetNameToList) =>
      (a: Address, key: string): [Address, Address] => {
        const [streetName1, streetName2] = f(a[key as "streetName"]);
        return [
          { ...a, [key]: streetName1 },
          { ...a, [key]: streetName2 },
        ];
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
    const streetNumberLens = lens<Address, number>("streetNumber");
    const getNeighborNumber = (streetNumber: number) =>
      streetNumber === 0
        ? [streetNumber + 1]
        : [streetNumber - 1, streetNumber + 1];
    const neighborFunctor =
      (f: typeof getNeighborNumber) => (a: Address, key: keyof Address) => {
        const [n1, n2] = f(a[key as "streetNumber"]);
        return [
          { ...a, [key]: n1 },
          { ...a, [key]: n2 },
        ];
      };

    it("Get street number, value is 1", () => {
      expect(streetNumberLens.get(address)).toBe(1);
    });
    it("Get street number, value is address.streetNumber", () => {
      expect(streetNumberLens.get(address)).toBe(address.streetNumber);
    });
    it("Replace street number, value is 2", () => {
      expect(streetNumberLens.replace(2)(address)).toMatchObject({
        ...address,
        streetNumber: 2,
      });
    });
    it("Modify street number, value is 1 + 10", () => {
      expect(streetNumberLens.modify((n) => n + 10)(address)).toMatchObject({
        ...address,
        streetNumber: address.streetNumber + 10,
      });
    });
    it("Modify street number with functor, value is list of neighbors", () => {
      expect(
        streetNumberLens.modifyF<number[], Address[]>(getNeighborNumber)(
          neighborFunctor
        )(address)
      ).toMatchObject([
        { ...address, streetNumber: address.streetNumber - 1 },
        { ...address, streetNumber: address.streetNumber + 1 },
      ]);
    });
  });

  describe("Composed lenses", () => {});
});

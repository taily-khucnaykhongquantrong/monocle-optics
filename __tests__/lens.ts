import * as lens from "@optics";
import { type Functor, type Map } from "@optics/utils";

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
    const arr: Array<number | string> = new Array(3)
      .fill(0)
      .map((_, index) => index + 1);
    const arrOf5thLens = lens.makeLens<typeof arr, number | string>(4);

    it("Get 5th element", () => {
      expect(arrOf5thLens.get(arr)).toBeUndefined();
    });

    it("Get 2nd element", () => {
      const arrOf2ndLens = lens.makeLens<typeof arr, number>(2);
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
      expect(arrOf5thLens.modify((n) => Number(n) + 5)(arr)).toMatchObject([
        1,
        2,
        3,
        undefined,
        NaN,
      ]);
    });

    it("Modify 5th element with String converter", () => {
      const numberToStringFunctor =
        (str: string) => (replacer: (str: string) => Array<string | number>) =>
          replacer(str);

      expect(
        arrOf5thLens.modifyF<string, Array<number | string>>(String)(
          numberToStringFunctor
        )(arr)
      ).toMatchObject([1, 2, 3, undefined, "undefined"]);
    });
  });

  describe("Promise of object Lens", () => {
    const person: Person = { name: "Tai", age: 27 };
    const ageLens = lens.makeLens<Person, number>("age");

    it("Update age with Promise lens", async () => {
      const updateAge = async (age: number) =>
        new Promise<number>((resolve) => {
          resolve(age + 1);
        });
      const updateAgeFunctor: Functor<
        Person,
        number,
        Promise<number>,
        Promise<Person>
      > = (newAge) => async (replacer) => newAge.then(replacer);

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
    const streetNameLens = lens.makeLens<Address, string>("streetName");
    const streetNameToList = (streetName: string): [string, string] => [
      `${streetName}1`,
      `${streetName}2`,
    ];
    const streetNameToListFunctor: Functor<
      Address,
      string,
      [string, string],
      [Address, Address]
    > =
      ([streetName1, streetName2]) =>
      (replacer) => [replacer(streetName1), replacer(streetName2)];

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
        streetNameLens.modifyF(streetNameToList)(streetNameToListFunctor)(
          address
        )
      );
    });
  });

  describe("Address with Street number Lens", () => {
    const address = {
      streetNumber: 1,
      streetName: "Ab",
    };
    const streetNumberLens = lens.makeLens<Address, number>("streetNumber");
    const getNeighborNumber = (streetNumber: number) =>
      streetNumber === 0
        ? [streetNumber + 1]
        : [streetNumber - 1, streetNumber + 1];
    const neighborFunctor: Functor<Address, number, number[], Address[]> =
      ([n1, n2]) =>
      (replacer) => [replacer(n1), replacer(n2)];

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

  describe("Composed lenses", () => {
    const address: Address = {
      streetName: "Nguyen Duy Trinh",
      streetNumber: 17,
    };
    const person: Person = {
      age: 18,
      name: "Tai",
      address,
    };
    const addressLens = lens.makeLens<Person, Address>("address");
    const streetNumberFromAddressLens = lens.makeLens<Address, number>(
      "streetNumber"
    );
    const streetNumberFromPersonLens = lens.compose(
      addressLens,
      streetNumberFromAddressLens
    );

    it("get streetNumber, value is 17", () => {
      expect(streetNumberFromPersonLens.get(person)).toBe(17);
    });
    it("replace streetNumber, value is 18", () => {
      expect(streetNumberFromPersonLens.replace(18)(person)).toMatchObject({
        ...person,
        address: {
          ...person.address,
          streetNumber: 18,
        },
      });
    });
    it("modify streetNumber, value is streetNumber + 5", () => {
      expect(
        streetNumberFromPersonLens.modify((n) => n + 5)(person)
      ).toMatchObject({
        ...person,
        address: {
          ...person.address,
          streetNumber: person.address!.streetNumber + 5,
        },
      });
    });
    it("modify streetNumber with Functor, value is streetNumber of neighbors", () => {
      const getNeighborNumber = (streetNumber: number) =>
        streetNumber === 0
          ? [streetNumber + 1]
          : [streetNumber - 1, streetNumber + 1];
      const neighborFunctor =
        ([n1, n2]: number[]) =>
        (replacer: (n: number) => Person) => [replacer(n1), replacer(n2)];

      expect(
        streetNumberFromPersonLens.modifyF(getNeighborNumber)(neighborFunctor)(
          person
        )
      ).toMatchObject([
        {
          ...person,
          address: {
            ...person.address,
            streetNumber: person.address!.streetNumber - 1,
          },
        },
        {
          ...person,
          address: {
            ...person.address,
            streetNumber: person.address!.streetNumber + 1,
          },
        },
      ]);
    });
  });
});

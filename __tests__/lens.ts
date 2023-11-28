import { lens } from "@optics";
import { type Functor } from "@optics/utils";

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

  /**
   * Must use Array<number | string> due to we test number => string functor.
   * At the end of this test, we focus on array of string or number.
   */
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
        1, 2, 3,
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
      ).toBeUndefined();
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

  describe("Address with Street Number Lens", () => {
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
  describe("Composition of composed lenses", () => {
    type Family = {
      owner: Person;
      members: Person[];
    };

    const address: Address = {
      streetName: "Nguyen Duy Trinh",
      streetNumber: 17,
    };
    const person: Person = {
      age: 18,
      name: "Tai",
      address,
    };
    const family: Family = {
      owner: { age: 48, name: "Hong" },
      members: [person],
    };
    const firstMemberLens = lens.makeLens<Family, Person>(["members", 0]);
    const addressLens = lens.makeLens<Person, Address>("address");
    const streetNumberLens = lens.makeLens<Address, number>("streetNumber");
    const memberAddressLens = lens.compose(firstMemberLens, addressLens);
    const memberStreetNumberLens = lens.compose(
      memberAddressLens,
      streetNumberLens
    );

    it("get streetNumber, value is 17", () => {
      expect(memberStreetNumberLens.get(family)).toBe(17);
    });
    it("replace streetNumber, value is 18", () => {
      expect(memberStreetNumberLens.replace(18)(family)).toMatchObject({
        ...family,
        members: [
          {
            ...family.members[0],
            address: {
              ...family.members[0].address,
              streetNumber: 18,
            },
          },
        ],
      });
    });
    it("modify streetNumber, value is streetNumber + 5", () => {
      expect(memberStreetNumberLens.modify((n) => n + 5)(family)).toMatchObject(
        {
          ...family,
          members: [
            {
              ...family.members[0],
              address: {
                ...family.members[0].address,
                streetNumber: family.members[0].address!.streetNumber + 5,
              },
            },
          ],
        }
      );
    });
    it("modify streetNumber with Functor, value is streetNumber of neighbors", () => {
      const getNeighborNumber = (streetNumber: number) =>
        streetNumber === 0
          ? [streetNumber + 1]
          : [streetNumber - 1, streetNumber + 1];
      const neighborFunctor =
        ([n1, n2]: number[]) =>
        (replacer: (n: number) => Family) => [replacer(n1), replacer(n2)];

      expect(
        memberStreetNumberLens.modifyF(getNeighborNumber)(neighborFunctor)(
          family
        )
      ).toMatchObject([
        {
          ...family,
          members: [
            {
              ...family.members[0],
              address: {
                ...family.members[0].address,
                streetNumber: family.members[0].address!.streetNumber - 1,
              },
            },
          ],
        },
        {
          ...family,
          members: [
            {
              ...family.members[0],
              address: {
                ...family.members[0].address,
                streetNumber: family.members[0].address!.streetNumber + 1,
              },
            },
          ],
        },
      ]);
    });
  });
  describe("Composed first undefined lenses", () => {
    const address: Address = {
      streetName: "Nguyen Duy Trinh",
      streetNumber: 17,
    };
    const person: Person = {
      age: 18,
      name: "Tai",
      address,
    };
    const undefinedLens1 = lens.makeLens<Person, Address>([
      "address",
      "nothing",
    ]);
    const undefinedLens2 = lens.makeLens<Address, number>([
      "streetNumber",
      "nothing",
      "here",
    ]);
    const composedUndefinedLens = lens.compose(undefinedLens1, undefinedLens2);

    it("get streetNumber, value is 17", () => {
      expect(composedUndefinedLens.get(person)).toBeUndefined();
    });
    it("replace streetNumber, value is 18", () => {
      expect(composedUndefinedLens.replace(18)(person)).toMatchObject(person);
    });
    it("modify streetNumber, value is streetNumber + 5", () => {
      expect(composedUndefinedLens.modify((n) => n + 5)(person)).toMatchObject(
        person
      );
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
        composedUndefinedLens.modifyF(getNeighborNumber)(neighborFunctor)(
          person
        )
      ).toBeUndefined();
    });
  });
  describe("Composed second undefined lenses", () => {
    const address: Address = {
      streetName: "Nguyen Duy Trinh",
      streetNumber: 17,
    };
    const person: Person = {
      age: 18,
      name: "Tai",
      address,
    };
    const undefinedLens1 = lens.makeLens<Person, Address>("address");
    const undefinedLens2 = lens.makeLens<Address, number>([
      "streetNumber",
      "nothing",
      "here",
    ]);
    const composedUndefinedLens = lens.compose(undefinedLens1, undefinedLens2);

    it("get streetNumber, value is 17", () => {
      expect(composedUndefinedLens.get(person)).toBeUndefined();
    });
    it("replace streetNumber, value is 18", () => {
      expect(composedUndefinedLens.replace(18)(person)).toMatchObject(person);
    });
    it("modify streetNumber, value is streetNumber + 5", () => {
      expect(composedUndefinedLens.modify((n) => n + 5)(person)).toMatchObject(
        person
      );
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
        composedUndefinedLens.modifyF(getNeighborNumber)(neighborFunctor)(
          person
        )
      ).toBeUndefined();
    });
  });

  describe("Lens from path", () => {
    const address: Address = {
      streetName: "Nguyen Duy Trinh",
      streetNumber: 17,
    };
    const person: Person = {
      age: 18,
      name: "Tai",
      address,
    };
    const streetNumberLens = lens.makeLens<Person, number>([
      "address",
      "streetNumber",
    ]);
    const getNeighborNumber = (streetNumber: number) =>
      streetNumber === 0
        ? [streetNumber + 1]
        : [streetNumber - 1, streetNumber + 1];
    const neighborFunctor: Functor<Person, number, number[], Person[]> =
      ([n1, n2]) =>
      (replacer) => [replacer(n1), replacer(n2)];

    it("Get street number, value is 17", () => {
      expect(streetNumberLens.get(person)).toBe(17);
    });
    it("Get street number, value is address.streetNumber", () => {
      expect(streetNumberLens.get(person)).toBe(person.address?.streetNumber);
    });
    it("Replace street number, value is 2", () => {
      expect(streetNumberLens.replace(2)(person)).toMatchObject({
        ...person,
        address: {
          ...address,
          streetNumber: 2,
        },
      });
    });
    it("Modify street number, value is 17 + 10", () => {
      expect(streetNumberLens.modify((n) => n + 10)(person)).toMatchObject({
        ...person,
        address: { ...address, streetNumber: address.streetNumber + 10 },
      });
    });
    it("Modify street number with functor, value is list of neighbors", () => {
      expect(
        streetNumberLens.modifyF<number[], Person[]>(getNeighborNumber)(
          neighborFunctor
        )(person)
      ).toMatchObject([
        {
          ...person,
          address: { ...address, streetNumber: address.streetNumber - 1 },
        },
        {
          ...person,
          address: { ...address, streetNumber: address.streetNumber + 1 },
        },
      ]);
    });
  });
  describe("Lens from undefined path", () => {
    const address: Address = {
      streetName: "Nguyen Duy Trinh",
      streetNumber: 17,
    };
    const person: Person = {
      age: 18,
      name: "Tai",
      address,
    };
    const nullLens = lens.makeLens<Person, undefined>([
      "address",
      "streetNumber",
      "nothing",
      "here",
    ]);

    it("Get null lens, value is undefined", () => {
      expect(nullLens.get(person)).toBeUndefined();
    });
    it("Replace null lens, value is undefined", () => {
      expect(nullLens.replace(undefined)(person)).toMatchObject(person);
    });
  });

  describe("Laws", () => {
    const address = {
      streetNumber: 1,
      streetName: "Ab",
    };
    const streetNumberLens = lens.makeLens<Address, number>("streetNumber");

    it("Get replace", () => {
      const n = streetNumberLens.get(address);
      if (n) {
        expect(streetNumberLens.replace(n)(address)).toMatchObject(address);
      }
    });
    it("Replace get", () => {
      expect(streetNumberLens.get(streetNumberLens.replace(22)(address))).toBe(
        22
      );
    });
  });
  describe("Laws composed", () => {
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

    it("Get replace", () => {
      const n = streetNumberFromPersonLens.get(person);
      if (n) {
        expect(streetNumberFromPersonLens.replace(n)(person)).toMatchObject(
          person
        );
      }
    });
    it("Replace get", () => {
      expect(
        streetNumberFromPersonLens.get(
          streetNumberFromPersonLens.replace(22)(person)
        )
      ).toBe(22);
    });
  });
  describe("Laws fromPath", () => {
    const address: Address = {
      streetName: "Nguyen Duy Trinh",
      streetNumber: 17,
    };
    const person: Person = {
      age: 18,
      name: "Tai",
      address,
    };
    const streetNumberLens = lens.makeLens<Person, number>([
      "address",
      "streetNumber",
    ]);

    it("Get replace", () => {
      const n = streetNumberLens.get(person);
      if (n) {
        expect(streetNumberLens.replace(n)(person)).toMatchObject(person);
      }
    });
    it("Replace get", () => {
      expect(streetNumberLens.get(streetNumberLens.replace(22)(person))).toBe(
        22
      );
    });
  });
});

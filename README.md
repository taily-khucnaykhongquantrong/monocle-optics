# optics-ts

My TypeScript implementation of https://www.optics.dev/Monocle/docs/optics.

## Introduction

Even though there are a lot of implementations of TypeScript out there, I will try to implement the simplest one. There are no dependencies. You don't have to use any external libraries to use this.

For functional programming (FP) scope, I do not add an Error Handler, the library will return `Either<undefined, A>`.

## Getting Started

> _To fully understand the concept of this library, you could go to [this blog](https://adueck.github.io/blog/functors-applicatives-and-monads-with-pictures-in-typescript/) to have a better understanding of Functors, Applicatives, And Monads. Then you could go to [the original library](https://www.optics.dev/Monocle/docs/optics) to understand the concept of optics._

Anyway, I will quickly explain the usage of this library here. There are many concepts here (`iso`, `lens`, `prism`, etc.), however, you could understand all of them as getters and setters (If you are a Front-end developer, you could call them selectors). I would pick `lens` as an example here.

As its name says, you use a lens when you want to focus on a piece of data instead of the whole thing. `lens` helps you do anything to that piece of data but remains intact to the data source.

```typescript
import { lens } from "@optics";

type Address = {
  number: number;
  streetName: string;
};
const address: Address = {
  number: 15,
  streetName: "The Street",
};
// Address -> number
const addressNumberLens = lens.makeLens<Address, number>("number");

// A simple getter.
expect(addressNumberLens.get(address)).toBe(15); // get method will return address.number.

// A simple setter with a value of 2.
expect(addressNumberLens.replace(2)(address)).toMatchObject({
  ...address,
  number: 2,
}); // replace method will set address.number = 2, with address.number is still 15.

// Or a more complex setter with a callback to increase the value by 10.
expect(addressNumberLens.modify((n) => n + 10)(address)).toMatchObject({
  ...address,
  number: address.number + 10,
}); // modify method will receive a replacer callback, apply address.number to n param, which here is 25.
```

In the above example, you can see I could manipulate data with `lens` focusing on `addressNumber`. From a simple getter, and setter to a more complex setter with callback. But that is not everything, the latter part is why I love using this library.

```typescript
// Now we have a mapping function. This will return a tuple of address numbers.
// number => [number, number]
const getNeighborNumber = (addressNumber: number) =>
  addressNumber === 0
    ? [addressNumber + 1]
    : [addressNumber - 1, addressNumber + 1];
// Now we have a neighbor functor with the type respect to the above mapper.
// ([number, number]) => (f: (n: number) => Address) => [Address, Address]
const neighborFunctor: Functor<Address, number, number[], Address[]> =
  ([n1, n2]) =>
  (replacer) => [replacer(n1), replacer(n2)];

// Boom 💥! Now we have a tuple of neighbor addresses.
// [number, number] => [Address, Address].
expect(
  addressNumberLens.modifyF<number[], Address[]>(getNeighborNumber)(
    neighborFunctor
  )(address)
).toMatchObject([
  { ...address, addressNumber: address.addressNumber - 1 },
  { ...address, addressNumber: address.addressNumber + 1 },
]);
```

## Status

- [x] Iso
- [x] Lens
- [ ] Prism
- [ ] Optional
- [ ] Traversal

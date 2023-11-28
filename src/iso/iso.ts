type Iso<S, A> = {
  readonly get: (s: S) => A;
  readonly reverseGet: (a: A) => S;
};

export function makeIso<S, A>(get: Iso<S, A>["get"]) {
  return function (reverseGet: Iso<S, A>["reverseGet"]): Iso<S, A> {
    return {
      get,
      reverseGet,
    };
  };
}

interface Iso<S, A> {
  readonly get: (s: S) => A;
  readonly reverseGet: (a: A) => S;
}

export function iso<S, A>(
  get: Iso<S, A>["get"],
  reverseGet: Iso<S, A>["reverseGet"]
): Iso<S, A> {
  return {
    get,
    reverseGet,
  };
}

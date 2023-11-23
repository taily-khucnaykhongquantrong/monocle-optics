export type Map<A, B> = (a: A) => B;

export type Key<S> = S extends Record<PropertyKey, unknown> ? keyof S : number;

export type ValueOf<S extends Record<Key<S>, unknown> | unknown[]> = S[Key<S>];

// Ref: https://stackoverflow.com/a/53276873/9748796
//      https://stackoverflow.com/questions/67761901/typescript-circular-constraint-in-a-strongly-typed-object
export type PartialRecord<K extends PropertyKey, V> = {
  [P in K]?: V;
};

export type Functor<S, A, T, EffectT> = (fa: T) => (f: Map<A, S>) => EffectT;

export function replace<S>(
  s: Record<Key<S>, unknown>,
  key: Key<S>,
  value: unknown
): S {
  let result: Record<PropertyKey, unknown> | unknown[];

  if (Array.isArray(s)) {
    result = [];
  } else {
    result = {};
  }

  // Using Object.assign to replace value whether it is an Object or Array.
  return Object.assign(result, s, { [key]: value }) as S;
}

export type Map<A, B> = (a: A) => B;

export type Key<S> = S extends Record<PropertyKey, unknown> ? keyof S : number;

export type ValueOf<S extends Record<Key<S>, unknown> | unknown[]> = S[Key<S>];

// Ref: https://stackoverflow.com/a/53276873/9748796
//      https://stackoverflow.com/questions/67761901/typescript-circular-constraint-in-a-strongly-typed-object
export type PartialRecord<K extends PropertyKey, V> = {
  [P in K]?: V;
};

export type Functor<S, A, T, EffectT> = (fa: T) => (f: Map<A, S>) => EffectT;

export const ERROR_MESSAGE = { ILLEGAL_LENS_KEY: "Illegal key" };

export type Either<L, R> = L | R;

export function replace<S extends Record<PropertyKey, unknown> | unknown[], A>(
  s: S,
  key: PropertyKey | PropertyKey[],
  value: A
): S {
  const clonedS = structuredClone(s);
  let a: S | A | unknown = clonedS;

  if (Array.isArray(key)) {
    let lastKey = key.at(-1);
    key.slice(0, key.length - 1).forEach((k) => {
      if (a && typeof a === "object") {
        a = (a as Record<PropertyKey, unknown>)[k];
      }
    });
    if (
      lastKey !== undefined &&
      a &&
      (a as Record<PropertyKey, unknown>)[lastKey]
    ) {
      (a as Record<PropertyKey, unknown>)[lastKey] = value;
    }
  } else {
    if (a && typeof a === "object") {
      (a as Record<PropertyKey, unknown>)[key] = value;
    }
  }

  return clonedS;
}

export function fromPath<
  S extends PartialRecord<PropertyKey, unknown> | unknown[],
  A,
>(path: PropertyKey[]): (s: S) => Either<undefined, A> {
  return function (s) {
    let result: Record<PropertyKey, unknown> | unknown[] | undefined = s;

    for (const key of path) {
      if (!result) {
        return undefined;
      }

      result = result[key as any] as
        | PartialRecord<PropertyKey, unknown>
        | unknown[];
    }

    return result as A;
  };
}

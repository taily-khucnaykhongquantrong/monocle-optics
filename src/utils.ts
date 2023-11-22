export type Map<A, B> = (a: A) => B;

export type Key<S> = S extends Record<string | number | symbol, unknown>
  ? keyof S
  : number;

export type ValueOf<S extends Record<Key<S>, unknown> | unknown[]> = S[Key<S>];

export function replace<S>(
  s: Record<Key<S>, unknown>,
  key: Key<S>,
  value: unknown
): S {
  let result: Record<string, unknown> | unknown[];

  if (Array.isArray(s)) {
    result = [];
  } else {
    result = {};
  }

  return Object.assign(result, s, { [key]: value }) as S;
}

export type Map<A, B> = (a: A) => B;

type Key = string | number | symbol;

export type ValueOf<S extends Record<Key, unknown>, K extends Key> = S[K];

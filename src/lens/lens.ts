import { replace as internalReplace, type Key, type Map } from "../utils";

type Lens<S, A> = {
  get: Map<S, A>;
  replace: Map<A, Map<S, S>>;
  modify: (f: Map<A, A>) => Map<S, S>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  modifyF: <B, FB>(
    f: Map<A, B>
  ) => (functor: (f2: typeof f) => (s: S, key: Key<S>) => FB) => (s: S) => FB;
};

export function lens<
  S extends Record<Key<S>, unknown> | unknown[],
  A extends S[Key<S>],
>(key: Key<S>): Lens<S, A> {
  return {
    get(s) {
      return s[key] as A;
    },
    replace(value) {
      return function (s) {
        return internalReplace(s, key, value);
      };
    },
    modify(f) {
      return function (s) {
        return internalReplace(s, key, f(s[key] as A));
      };
    },
    modifyF(f) {
      return function (functor) {
        return function (s) {
          return functor(f)(s, key);
        };
      };
    },
  };
}

import type { Map, ValueOf } from "./utils";

type Lens<S extends Record<string, unknown>, A> = {
  get: Map<S, A>;
  replace: Map<A, Map<S, S>>;
  modify: (f: Map<A, A>) => Map<S, S>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  modifyF: <B, FB>(
    f: Map<A, B>
  ) => (functor: (f2: typeof f) => Map<S, FB>) => (s: S) => FB;
};

export function lens<S extends Record<string, unknown>, K extends keyof S>(
  key: K
): Lens<S, ValueOf<S, K>> {
  return {
    get(s) {
      return s[key];
    },
    replace(value) {
      return function (s) {
        return { ...s, [key]: value };
      };
    },
    modify(f) {
      return function (s) {
        return { ...s, [key]: f(s[key]) };
      };
    },
    modifyF(f) {
      return function (functor) {
        return function (s) {
          return functor(f)(s);
        };
      };
    },
  };
}

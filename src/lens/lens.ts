/* eslint-disable @typescript-eslint/naming-convention */
import {
  replace as internalReplace,
  type PartialRecord,
  type Key,
  type Map,
  type Functor,
} from "../utils";

type Lens<S, A> = {
  get: Map<S, A>;
  replace: Map<A, Map<S, S>>;
  modify: (f: Map<A, A>) => Map<S, S>;
  modifyF: <T, FT>(
    f: Map<A, T>
  ) => (functor: Functor<S, A, T, FT>) => (s: S) => FT;
};

export function makeLens<
  S extends PartialRecord<PropertyKey, unknown> | unknown[],
  A extends S[Key<S>],
>(key: Key<S>): Lens<S, A> {
  const lens: Lens<S, A> = {
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
        const a = lens.get(s);
        const value = f(a);

        return internalReplace(s, key, value);
      };
    },
    modifyF(f) {
      return function (functor) {
        return function (s) {
          const a = lens.get(s);
          const fa = f(a);

          return functor(fa)((newA) => lens.replace(newA)(s));
        };
      };
    },
  };

  return lens;
}

export function compose<
  S extends PartialRecord<PropertyKey, unknown> | unknown[],
  A extends PartialRecord<PropertyKey, unknown> | unknown[],
  B extends A[Key<A>],
>(lensA: Lens<S, A>, lensB: Lens<A, B>): Lens<S, B> {
  const lens: Lens<S, B> = {
    get(s) {
      return lensB.get(lensA.get(s));
    },
    replace(value) {
      return function (s) {
        const a = lensA.get(s);
        const newA = lensB.replace(value)(a);

        return lensA.replace(newA)(s);
      };
    },
    modify(f) {
      return function (s) {
        const a = lensA.get(s);
        const newA = lensB.modify(f)(a);

        return lensA.replace(newA)(s);
      };
    },
    modifyF(f) {
      return function (functor) {
        return function (s) {
          const a = lensA.get(s);
          const b = lensB.get(a);
          const fb = f(b);

          return functor(fb)((newB) =>
            lensA.replace(lensB.replace(newB)(a))(s)
          );
        };
      };
    },
  };

  return lens;
}

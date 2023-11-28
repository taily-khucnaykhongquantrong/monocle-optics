/* eslint-disable @typescript-eslint/naming-convention */
import {
  fromPath,
  replace as internalReplace,
  type Either,
  type PartialRecord,
  type Key,
  type Map,
  type Functor,
} from "@optics/utils";

type Lens<S, A> = {
  get: Map<S, Either<undefined, A>>;
  replace: Map<A, Map<S, S>>;
  modify: (f: Map<A, A>) => Map<S, S>;
  modifyF: <T, FT>(
    f: Map<A, T>
  ) => (
    functor: Functor<S, A, T, Either<undefined, FT>>
  ) => (s: S) => Either<undefined, FT>;
};

export function makeLens<
  S extends PartialRecord<PropertyKey, unknown> | unknown[],
  A extends S[Key<S>],
>(key: Key<S> | Array<PropertyKey>): Lens<S, A> {
  const lens: Lens<S, A> = {
    get(s) {
      if (Array.isArray(key)) {
        return fromPath<S, A>(key)(s);
      }
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
        if (!a) {
          return s;
        }
        const value = f(a);

        return internalReplace(s, key, value);
      };
    },
    modifyF(f) {
      return function (functor) {
        return function (s) {
          const a = lens.get(s);

          if (!a) {
            return a as undefined;
          }

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
      const a = lensA.get(s);

      if (!a) {
        return a;
      }

      return lensB.get(a);
    },
    replace(value) {
      return function (s) {
        const a = lensA.get(s);
        if (!a) {
          return s;
        }
        const newA = lensB.replace(value)(a);

        return lensA.replace(newA)(s);
      };
    },
    modify(f) {
      return function (s) {
        const a = lensA.get(s);
        if (!a) {
          return s;
        }

        const newA = lensB.modify(f)(a);

        return lensA.replace(newA)(s);
      };
    },
    modifyF(f) {
      return function (functor) {
        return function (s) {
          const a = lensA.get(s);
          if (!a) {
            return a;
          }

          const b = lensB.get(a);
          if (!b) {
            return b as undefined;
          }

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

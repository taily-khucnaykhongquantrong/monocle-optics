interface Lens<S extends { [key: string]: unknown }, A> {
  get: (s: S) => A;
  replace: (s: S) => (a: A) => S;
}

export function lens<S extends { [key: string]: unknown }, A>(
  key: string
): Lens<S, A> {
  return {
    get(s) {
      return s[key] as A;
    },
    replace(s) {
      return function (value) {
        return { ...s, [key]: value };
      };
    },
  };
}

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/__tests__/**/*.ts"],
  moduleNameMapper: {
    "@optics/(.*)": "<rootDir>/src/$1",
    "@optics": "<rootDir>/src/index",
  },
};

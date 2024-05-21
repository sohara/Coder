import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

export default createJestConfig(config);
// module.exports = {
//   testEnvironment: "jest-environment-jsdom",
//   setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
//   transform: {
//     "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
//   },
//   moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
//   moduleNameMapper: {
//     "^@/(.*)$": "<rootDir>/src/$1",
//     "^next/router$": "<rootDir>/__mocks__/next/router.ts",
//   },
//   transformIgnorePatterns: ["/node_modules/"],
// };

process.env.TZ = "America/New_York";

module.exports = {
  transform: {
    "\\.(js|jsx|ts|tsx)$": "ts-jest",
    // "\\.(gql|graphql)$": "jest-transform-graphql",
  },
  transformIgnorePatterns: ["node_modules\\/(?!(lodash-es|react-apollo)\\/)"],
  testMatch: null, // override the testMatch inherited from ts-jest, in order to avoid conflicting with testRegex: https://kulshekhar.github.io/ts-jest/user/config/#basic-usage
  testRegex: "modules/.*\\.(test|spec)\\.(ts|tsx)$",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json"],
  moduleNameMapper: {
    "\\.(css|less|scss)$": "identity-obj-proxy",
    "\\.(gif|ttf|eot|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },
  moduleDirectories: ["modules", "node_modules"],
  globalSetup: "<rootDir>/modules/__tests__/global-setup.ts",
  globals: {
    __DEV__: true,
    __TEST__: true,
    "ts-jest": {
      tsConfig: "tsconfig.jest.json",
      isolatedModules: true,
      babelConfig: false,
      diagnostics: {
        ignoreCodes: [151001],
      },
    },
  },
  setupFilesAfterEnv: ["<rootDir>/modules/__tests__/setup-files-after-env.ts"],
  reporters: [
    "default",
    [
      "jest-junit",
      {
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
        addFileAttribute: "true",
      },
    ],
  ],
};

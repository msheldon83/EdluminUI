const fs = require("fs");
let schemaString;
try {
  schemaString = fs.readFileSync(
    "./modules/graphql/server-schema.graphql",
    "utf8"
  );
} catch (err) {
  schemaString = "";
}

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:jest/recommended",
    "plugin:react/recommended",
    "prettier",
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
    Config: "readonly",
    __DEV__: "readonly",
    __TEST__: "readonly",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.base.json",
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    useJSXTextNode: true,
    extraFileExtensions: [".tsx", ".d.ts"],
  },
  plugins: ["react", "react-hooks", "@typescript-eslint", "jest", "graphql"],
  /*
  https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/ROADMAP.md
   */
  rules: {
    "@typescript-eslint/ban-types": [
      "error",
      {
        types: {
          "React.SFC": {
            message: "Use FunctionComponent instead",
            fixWith: "React.FunctionComponent",
          },
          // These might be things we should remove,
          // but it'd be a lot of work, so I'm disabling them for now
          "{}": false,
          Function: false,
          object: false,
        },
      },
    ],
    "graphql/template-strings": [
      "error",
      {
        env: "literal",
        schemaString: schemaString,
      },
    ],

    // error!
    "@typescript-eslint/no-for-in-array": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "handle-callback-err": "error",
    "no-extra-semi": "error",
    "no-fallthrough": "error",
    "no-irregular-whitespace": ["error", { skipStrings: false }],
    "no-restricted-imports": ["error", "lodash"],
    "no-restricted-properties": [
      2,
      {
        object: "React",
        property: "SFC",
        message: "Please use Object.defineProperty instead.",
      },
    ],
    "no-sparse-arrays": "error",
    "react-hooks/rules-of-hooks": "error",
    "react/jsx-key": "error",

    // keep these "warn" for now
    "@typescript-eslint/consistent-type-assertions": "warn",
    "@typescript-eslint/no-empty-interface": "warn",
    "@typescript-eslint/no-floating-promises": "warn",
    "@typescript-eslint/no-inferrable-types": "warn",
    "@typescript-eslint/no-unsafe-member-access": 0,
    "@typescript-eslint/no-unsafe-return": 0,
    "@typescript-eslint/no-unsafe-assignment": 0,
    "@typescript-eslint/no-unsafe-call": 0,
    "@typescript-eslint/explicit-module-boundary-types": 0,
    "no-async-promise-executor": "warn",
    "no-case-declarations": "warn",
    "no-empty": "warn",
    "no-prototype-builtins": "warn",
    "no-redeclare": "warn",
    "no-undef": 0, // disable this until eslint bugs are fixed
    "no-unreachable": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "react/no-children-prop": "warn",
    "react/no-unescaped-entities": "warn",
    "require-atomic-updates": "warn",

    // way may want these eventually, but they'll be a chore to fix:
    "@typescript-eslint/camelcase": 0,
    "@typescript-eslint/interface-name-prefix": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    // the translation function t returns string | undefined, so this one causes a lot of problems
    "@typescript-eslint/restrict-template-expressions": 0,
    "@typescript-eslint/no-object-literal-type-assertion": 0, // e.g. `{...} as Foo`, which we use for branding and permissions
    // "@typescript-eslint/no-parameter-properties": 0,
    // "jest/no-alias-methods": 0,
    // "no-dupe-class-members": 0,
    "react/display-name": 0,

    // don't want, at least for now:
    "@typescript-eslint/no-empty-function": 0,
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/require-await": 0,
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/no-namespace": 0,
    "@typescript-eslint/no-unused-vars": 0,
    "@typescript-eslint/no-use-before-define": 0,
    "@typescript-eslint/prefer-interface": 0,
    "no-console": 0,
    "no-inner-declarations": 0,
    "no-unused-vars": 0,
    "react/prop-types": 0,

    // these conflict with prettier:
    "@typescript-eslint/indent": 0,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};

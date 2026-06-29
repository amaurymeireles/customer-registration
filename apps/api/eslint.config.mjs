import tseslint from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";

const nodeGlobals = {
  console: "readonly",
  process: "readonly",
};

const jestGlobals = {
  beforeEach: "readonly",
  describe: "readonly",
  expect: "readonly",
  it: "readonly",
  jest: "readonly",
};

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: nodeGlobals,
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["src/**/*.spec.ts"],
    languageOptions: {
      globals: {
        ...nodeGlobals,
        ...jestGlobals,
      },
    },
  },
];

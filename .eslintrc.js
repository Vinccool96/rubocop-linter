module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    jest: true,
  },
  root: true,
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/recommended",
    "prettier",
    "plugin:prettier/recommended",
  ],
  globals: {},
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  ignorePatterns: ["lib/*"],
  rules: {
    "no-cond-assign": [2, "except-parens"],
    "no-unused-vars": 0,
    "no-redeclare": 0,
    "@typescript-eslint/no-unused-vars": 1,
    "no-empty": [
      "error",
      {
        allowEmptyCatch: true,
      },
    ],
    "prefer-const": [
      "warn",
      {
        destructuring: "all",
      },
    ],
    "spaced-comment": "warn",
    quotes: [
      "error",
      "double",
      { avoidEscape: true, allowTemplateLiterals: false },
    ],
    "quote-props": ["error", "as-needed"],
    "comma-dangle": ["error", "always-multiline"],
  },
}

module.exports = {
  env: {
    es2021: true,
    node: true,
    "jest/globals": true
  },
  extends: [
    "eslint:recommended",
    "plugin:jest/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module"
  },
  plugins: [
    "jest",
    "@typescript-eslint"
  ],
  rules: {
    indent: [
      "error",
      2
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    quotes: [
      "error",
      "double"
    ],
    semi: [
      "error",
      "never"
    ]
  }
}

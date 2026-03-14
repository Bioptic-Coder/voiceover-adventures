import js from "@eslint/js";
import tseslint from "typescript-eslint";
import preactPlugin from "eslint-plugin-preact";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      preact: preactPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        HTMLElement: "readonly",
        KeyboardEvent: "readonly",
        OscillatorType: "readonly",
        AudioContext: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    },
  },
  {
    ignores: ["dist/", "node_modules/"],
  }
);

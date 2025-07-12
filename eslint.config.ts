// eslint.config.ts
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Extends the recommended configurations for TypeScript, including type-aware rules.
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Your custom configurations go here
  {
    // This section is crucial for type-aware rules.
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    // Apply this configuration to all files
    files: ["**/*.ts"],

    // Add your custom rules or override recommended ones
    rules: {
      // Example: require semicolons at the end of statements
      //"@typescript-eslint/semi": ["error", "always"],
      // Example: enforce consistent type imports
      "@typescript-eslint/consistent-type-imports": "error",
      // The rule that caused the error, '@typescript-eslint/no-floating-promises',
      // is included in 'recommendedTypeChecked' and will now work correctly.
    },
  },
  {
    // You can specify different rules for different files
    files: ["tests/**/*.ts"],
    rules: {
      // Looser rules for test files if needed
    },
  },
  {
    // Ignore files that should not be linted
    ignores: ["node_modules/", "dist/", "playwright.config.ts"],
  }
);

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettiereslint from "eslint-config-prettier";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.mjs", "prettier.config.mjs", "tsup.config.ts", "vitest.config.ts"],
        },
      },
    },
  },
  prettiereslint,
);

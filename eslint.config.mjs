import eslint from "@eslint/js";
import typescriptEslint from "typescript-eslint";
import vitestEslint from "eslint-plugin-vitest";
import prettierEslint from "eslint-config-prettier";

export default typescriptEslint.config(
  eslint.configs.recommended,
  ...typescriptEslint.configs.strictTypeChecked,
  ...typescriptEslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.mjs", "prettier.config.mjs", "tsup.config.ts", "vitest.config.ts"],
        },
      },
    },
  },
  {
    files: ["./src/**/*.test.ts"],
    plugins: {
      vitest: vitestEslint,
    },
    rules: {
      ...vitestEslint.configs.recommended.rules,
    },
    settings: {
      vitest: {
        typecheck: true,
      },
    },
    languageOptions: {
      globals: {
        ...vitestEslint.environments.env.globals,
      },
    },
  },
  prettierEslint,
);

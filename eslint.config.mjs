import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import jsxA11y from "eslint-plugin-jsx-a11y";

// eslint-config-next 15 still ships eslintrc-shaped configs; FlatCompat is the
// supported bridge into flat config.
const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const eslintConfig = [
  { ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // eslint-config-next already registers the jsx-a11y plugin, so only its
    // rule set is layered on — re-registering the plugin is a config error.
    rules: {
      ...jsxA11y.flatConfigs.strict.rules,
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/consistent-type-imports": "warn",
      // Every external link must name its destination for screen readers.
      "jsx-a11y/anchor-ambiguous-text": "error",
    },
  },
];

export default eslintConfig;

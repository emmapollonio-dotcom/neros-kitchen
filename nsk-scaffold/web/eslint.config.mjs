import { FlatCompat } from "@eslint/eslintrc";

// ESLint 9 richiede il formato "flat config": non esisteva prima in questo
// scaffold, quindi `npm run lint` falliva sempre con "couldn't find
// eslint.config.js" — sia in locale sia (probabilmente) nella CI. FlatCompat
// ci permette di riusare `eslint-config-next` (che espone ancora il vecchio
// formato "extends") senza doverlo riscrivere a mano.
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Convenzione del progetto: parametri non usati prefissati con "_"
      // (es. handler Next.js che non leggono `req`) sono intenzionali.
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      // File auto-generato da Next.js ad ogni build: non va modificato né lintato a mano.
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;

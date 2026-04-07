import globals from 'globals';
import tseslint from 'typescript-eslint';
import json from '@eslint/json';
/**
 * Shared ESLint flat config for all Komodo TypeScript projects.
 *
 * Includes typescript-eslint recommended rules, Node.js globals, and JSON linting.
 * Spread this into your project's eslint.config.mts and add any overrides after.
 *
 * @example
 * ```ts
 * // eslint.config.mts
 * import komodoConfig from '@komodo-forge-sdk/typescript/eslint';
 * export default [...komodoConfig];
 * ```
 *
 * With project-level overrides:
 * @example
 * ```ts
 * import komodoConfig from '@komodo-forge-sdk/typescript/eslint';
 * export default [
 *   ...komodoConfig,
 *   {
 *     rules: {
 *       '@typescript-eslint/no-explicit-any': 'error',
 *     },
 *   },
 * ];
 * ```
 */
const komodoConfig = tseslint.config({
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
        globals: globals.node,
    },
}, tseslint.configs.recommended, {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
});
export default komodoConfig;
//# sourceMappingURL=index.js.map
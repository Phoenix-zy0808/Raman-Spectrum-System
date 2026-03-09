module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    parser: '@typescript-eslint/parser'
  },
  rules: {
    // TypeScript 规则
    "@typescript-eslint/ban-ts-comment": "error",
    "@typescript-eslint/no-explicit-any": "error",  // 禁止使用 any
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    '@typescript-eslint/no-var-requires': 0,
    "@typescript-eslint/prefer-as-const": "error",
    "@typescript-eslint/no-non-null-assertion": "warn",

    // Vue 规则
    'vue/multi-word-component-names': 'off',
    'vue/no-mutating-props': 'off',

    // 通用规则
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-unused-vars': 'off', // 使用 TypeScript 的版本
    'prefer-const': 'error',
    'no-var': 'error',

    // 代码风格
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'comma-dangle': ['error', 'only-multiline'],
  }
}

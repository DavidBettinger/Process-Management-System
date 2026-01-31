const tsParser = require('@typescript-eslint/parser');

module.exports = [
  {
    files: ['src/app/features/**/*.ts', 'src/app/shared/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'AwaitExpression',
          message: 'Do not use await in app layer; use RxJS operators.'
        },
        {
          selector:
            'FunctionDeclaration[async=true], FunctionExpression[async=true], ArrowFunctionExpression[async=true], MethodDefinition[async=true]',
          message: 'Do not use async functions in app layer; return Observables.'
        }
      ]
    }
  }
];

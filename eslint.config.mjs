import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-plugin-prettier';

export default [
	// Base recommended configs
	js.configs.recommended,

	// Global configuration
	{
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				window: 'readonly',
				document: 'readonly',
				console: 'readonly',
				process: 'readonly',
				Buffer: 'readonly',
				__dirname: 'readonly',
				require: 'readonly',
				module: 'readonly',
				exports: 'readonly',
				global: 'readonly',
				fetch: 'readonly',
				Thenable: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': typescript,
			react,
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			prettier,
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		rules: {
			'prettier/prettier': [
				'error',
				{},
				{
					usePrettierrc: true,
				},
			],
			'linebreak-style': 'off',
			'react/prop-types': 'off',
			'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/ban-ts-comment': [
				'error',
				{
					'ts-nocheck': 'allow-with-description',
				},
			],
		},
	},

	// TypeScript files
	{
		files: ['**/*.ts', '**/*.tsx'],
		rules: {
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'no-unused-vars': 'off', // Turn off base rule for TypeScript files
		},
	},

	// React specific rules
	{
		files: ['**/*.jsx', '**/*.tsx'],
		rules: {
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true },
			],
		},
	},

	// Ignore patterns
	{
		ignores: [
			'extension/out/**',
			'server/out/**',
			'build/**',
			'out/**',
			'**/*.d.ts',
			'node_modules/**',
			'.vscode-test/**',
		],
	},
];

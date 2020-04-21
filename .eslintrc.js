module.exports = {

	"root": true,
	"env": {
		"node": true
	},
	"extends": [
		"plugin:vue/essential",
		"eslint:recommended"
	],
	"parserOptions": {
		"parser": "babel-eslint"
	},
	"rules": {
		// allow debugger during development
		'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
		// my：分号结尾 无
		'semi': ['error', 'always'],
		'space-before-function-paren': 0,
	},
	"overrides": [
		{
			"files": [
				"**/__tests__/*.{j,t}s?(x)",
				"**/tests/unit/**/*.spec.{j,t}s?(x)"
			],
			"env": {
				"mocha": true
			}
		},
		{
			"files": [
				"**/__tests__/*.{j,t}s?(x)",
				"**/tests/unit/**/*.spec.{j,t}s?(x)"
			],
			"env": {
				"mocha": true
			}
		}
	]
}

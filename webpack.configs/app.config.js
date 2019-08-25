/*eslint no-unused-vars: "off"*/

const webpack = require('webpack'),
	poststylus = require('poststylus'),
	lessToJs = require('less-vars-to-js'),
	config = require('../config'),
	fs = require('fs'),
	path = require('path'),
	is_production_build = (config.env === 'production'),
	build_type = config.type,
	pjson = require('../package.json'),
	themeVariables = lessToJs(fs.readFileSync(path.join(__dirname, '../src/app/styles/ant-theme-vars.less'), 'utf8'));

module.exports = {
	entry: './src/app/js/index.js',
	output: {
		path: path.resolve(__dirname, '../build/app'),
		filename: 'bundle.js'
	},
	devServer: {
		inline: true,
		contentBase: './dist',
		port: 9090
	},
	module: {
		rules: [
			/*{
				test: /\.js$/,
				loader: 'flowtype-loader',
				enforce: 'pre',
				exclude: /node_modules/
			},*/
			{
				test: /\.js$/,
				enforce: 'pre',
				use: [
					'eslint-loader',
					'babel-loader?' + JSON.stringify({
						plugins: [
							['import', { libraryName: 'antd', style: true }]
						]
					}),
					'string-replace-loader?' + JSON.stringify({
						multiple: [
							{
								search: '##PR_STRING_REPLACE_ACCOUNT_BASE_PATH##',
								replace: (build_type === 'deploy') ? (pjson.scripts.deploy_at == 'phoenixrobotix' ? 'https://accounts.phoenixrobotix.com' : 'https://taru.aurassure.com') : 'https://dev.datoms.io/accounts',
								flags: 'g'
							},
							{
								search: '##PR_STRING_REPLACE_APP_VERSION_SLUG##',
								replace: pjson.version ? ('v' + pjson.version.replace(/[.]/g, '-')) : '',
								flags: 'g'
							},
							{
								search: '##PR_STRING_REPLACE_API_BASE_PATH##',
								replace: (is_production_build ? (build_type === 'stage' ? 'https://dev.datoms.io/datoms/flood_monitoring/api' : (pjson.scripts.deploy_at == 'phoenixrobotix' ? 'https://api.phoenixrobotix.com' : '')) : 'http://taru.aurassure.com') + '/-/api/flood-monitoring' + (pjson.version ? ('/v' + '1.1.0') : '') + '/clients/365/applications/19',
								flags: 'g'
							},
							{
								search: '##PR_STRING_REPLACE_LOCAL_API_BASE_PATH##',
								replace: (is_production_build ? (build_type === 'stage' ? 'https://dev.datoms.io/datoms/flood_monitoring/api' : (pjson.scripts.deploy_at == 'phoenixrobotix' ? 'https://api.phoenixrobotix.com' : '')) : 'http://localhost:9091') + '/-/api/flood-monitoring' + (pjson.version ? ('/v' + '1.2.0') : '') + '/clients/365/applications/19',
								flags: 'g'
							},
							{
								search: '##PR_STRING_REPLACE_USERS_API_BASE_PATH##',
								replace: is_production_build ? (build_type === 'stage' ? 'https://dev.datoms.io/datoms/user_management_library/api' : (pjson.scripts.deploy_at == 'phoenixrobotix' ? 'https://api.phoenixrobotix.com/datoms/user_management_library_v1.0.0' : '/-/api/datoms-core/v1.0.0')) : 'http://127.0.0.1:9089',
								flags: 'g'
							},
							{
								search: '##PR_STRING_REPLACE_API_USER_BASE_PATH##',
								replace: is_production_build ? (build_type === 'stage' ? 'https://dev.datoms.io/aurassure-webapp/smart_city_platform/api/' : 'https://api.aurassure.com/smart_city_platform/') : 'https://dev.datoms.io/api/aurassure-webapp/smart_city_platform/',
								flags: 'g'
							},
							{
								search: '##PR_STRING_REPLACE_IMAGE_BASE_PATH##',
								replace: is_production_build ? 'https://prstatic.phoenixrobotix.com/imgs/flood_monitoring/' : 'https://dev.datoms.io/datoms/flood_monitoring/images/',
								flags: 'g'
							},
							{
								search: '##PR_STRING_REPLACE_APP_BASE_PATH##',
								replace: is_production_build ? build_type : '',
								flags: 'g'
							}
						]
					})
				],
				include: path.join(__dirname, '../src/app'),
				exclude: '/node_modules/'
			},
			{
				test: /\.styl$/,
				use: [
					'style-loader',
					'css-loader',
					'stylus-loader'
				]
			},
			{
				test: /\.less$/,
				use: [
					'style-loader',
					'css-loader',
					'less-loader?' + JSON.stringify({
						modifyVars: themeVariables,
						javascriptEnabled: true
					})
				]
			}
		],
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel-loader?' + JSON.stringify({
					plugins: [
						['import', { libraryName: 'antd', style: true }]
					]
				}),
				exclude: /node_modules/
			},
			{
				test: /\.json$/,
				loader: 'json'
			},
			{
				test: /\.styl$/,
				loader: 'style-loader!css-loader!stylus-loader'
			},
			{
				test: /\.less$/,
				loader: 'style-loader!css-loader!less-loader?' + JSON.stringify({
					modifyVars: themeVariables,
					javascriptEnabled: true
				})
			}
		]
	},
	plugins: is_production_build ? [
		// new FlowtypePlugin(),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('production')
			}
		}),
		new webpack.optimize.AggressiveMergingPlugin(),
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			mangle: true,
			compress: {
				booleans: true, // Various optimizations for boolean context. E.g.: !!a ? b : c → a ? b : c
				warnings: false, // Display warnings when dropping unreachable code or unused declarations etc.
				pure_getters: true, // It will assume that object property access. (E.g.: foo.bar or foo["bar"])
				unsafe: true, // It enables some transformations that might break code logic in certain contrived cases, but should be fine for most code. E.g.: new Array(1, 2, 3) or Array(1, 2, 3) → [1, 2, 3]
				screw_ie8: true, // Pass this flag if you don't care about full compliance with IE 6-8 quirks.
				conditionals: true, // Apply optimizations for if-s and conditional expressions.
				unused: true, // Drop unreferenced functions and variables.
				comparisons: true, // Apply optimizations to binary nodes. E.g.: !(a <= b) → a > b (only when unsafe)
				sequences: true, // Join consecutive simple statements using the comma operator
				drop_debugger: true, // Remove debugger; statements.
				drop_console: (build_type === 'stage') ? false : (pjson.scripts.deploy_at == 'phoenixrobotix' ? false : false), // Pass true to discard calls to console.* functions.
				dead_code: true, // Remove unreachable code.
				evaluate: true, // Attempt to evaluate constant expressions.
				if_return: true, // Optimizations for if/return and if/continue.
				join_vars: true, // Join consecutive var statements.
				properties: true, // Rewrite property access using the dot notation. E.g.: foo["bar"] → foo.bar
			},
			output: {
				comments: false
			},
			exclude: [/\.min\.js$/gi] // skip pre-minified libs
		})
	] : []
};
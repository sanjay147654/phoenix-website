const config = require('../config'),
	path = require('path'),
	is_production_build = (config.env === 'production'),
	build_type = config.type,
	webpack = require('webpack'),
	fs = require('fs'),
	pjson = require('../package.json');

var nodeModules = {};

fs.readdirSync('node_modules')
.filter(function(x) {
	return ['.bin'].indexOf(x) === -1;
})
.forEach(function(mod) {
	nodeModules[mod] = 'commonjs ' + mod;
});

module.exports = {
	entry: './src/api/index.js',
	target: 'node',
	output: {
		path: path.join(__dirname, '../build/api'),
		filename: 'backend.js'
	},
	resolveLoader: {
		moduleExtensions: ['-loader']
    },
    module:{
		loaders: [
			{
				test: /\.js$/,
				loaders: [
					'babel-loader'
				],
				exclude: /node_modules/
			}
		]
	},
	externals: nodeModules,
	plugins: is_production_build ? [
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('production'),
				BUILD_MODE: JSON.stringify(config.type),
				PORT: pjson.scripts.backend_port
			}
		}),
		new webpack.IgnorePlugin(/\.(css|less)$/),		
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
				drop_console: (build_type === 'stage') ? false : true, // Pass true to discard calls to console.* functions.
				dead_code: true, // Remove unreachable code.
				evaluate: true, // Attempt to evaluate constant expressions.
				if_return: true, // Optimizations for if/return and if/continue.
				join_vars: true, // Join consecutive var statements.
				properties: true, // Rewrite property access using the dot notation. E.g.: foo["bar"] → foo.bar
			},
			output: {
				comments: false
			},
			exclude: [/\.min\.js$/gi] // skip pre-minified lib
		})
	] : [
		new webpack.IgnorePlugin(/\.(css|less)$/),
		new webpack.BannerPlugin({banner: 'require("source-map-support").install();', raw: true, entryOnly: false})
    ],
    devtool: is_production_build ? '' : 'sourcemap'
}
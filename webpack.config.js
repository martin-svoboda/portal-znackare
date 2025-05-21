/**
 * Configuration of the build process
 * - entry: what do you want to compile
 * - output: where the compiled files endup
 * - copy: what to copy from build folder where
 * - sprites: define from where generate svg sprites
 */

const config = {
	entry: {
		'plugin': ['./assets/scripts/plugin.js', './assets/styles/plugin.scss'],
		'block-editor': './assets/scripts/block-editor.js',
		'editor-style': './assets/styles/editor-style.scss',
		'portal': './assets/apps/portal/app.js',
	},
	output: {
		path: 'build',
	},
};

/**
 * Import dependencies for build process
 */

const path = require('path');
const fs = require('fs');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const packageJson = require('./package.json');

/**
 * Resolves absolute paths for entry from configuration
 *
 * @param paths
 * @returns {string|{}|*}
 */

const resolvePathsRecursively = (paths) => {
	if (typeof paths === 'string') {
		return path.resolve(__dirname, paths);
	} else if (Array.isArray(paths)) {
		return paths.map(resolvePathsRecursively);
	} else if (Object(paths) === paths) {
		const resolvedPaths = {};

		Object.keys(paths).forEach(key => {
			resolvedPaths[key] = resolvePathsRecursively(paths[key]);
		});

		return resolvedPaths;
	}
};


/**
 * Exports the configuration for the build process
 */

module.exports = {
	...defaultConfig,
	entry: resolvePathsRecursively(config.entry),
	output: {
		...defaultConfig.output,
		path: resolvePathsRecursively(config.output.path)
	},
	resolve: {
		...defaultConfig.resolve,
		extensions: ['.js', '.json', '.jsx', '.ts', '.tsx'],
		alias: {
			'react': 'React',
			'react-dom': 'ReactDOM',
		},
	},
	externals: {
		react: false,
		'react-dom': 'ReactDOM',
		'react/jsx-runtime': 'React',
	},
	module: {
		...defaultConfig.module,
		rules: [
			{
				test: /\.tsx?$/,
				use: {
					loader: 'ts-loader',
					options: {
						transpileOnly: true,
					},
				},
				exclude: /node_modules/,
				include: [path.resolve(__dirname, 'assets')],

			},
			...defaultConfig.module.rules.map((rule) => {
				if (rule.test.test('.scss')) {
					rule.use.forEach(use => {
						if (use.loader === require.resolve('sass-loader')) {
							use.options.sassOptions = {
								...(use.options.sassOptions || null),
							};
						}
					});
				}

				return rule;
			}),
		],
	},
	plugins: [
		...defaultConfig.plugins,
	],
};

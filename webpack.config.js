module.exports = {
	mode: "production",
	// mode: "development",
	// devtool: "inline-source-map",
	target: "node",
	entry: {
		app: "./src/index.ts",
	},
	output: {
		path: __dirname + "/dist",
		filename: "[name].js",
	},
	resolve: {
		mainFields: ["main", "browser"],
		extensions: [".ts", ".js"], //resolve all the modules other than index.ts
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: {
					loader: "ts-loader",
					options: {
						transpileOnly: true,
					},
				},
			},
		],
	},
};

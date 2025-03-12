const TerserPlugin = require("terser-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  ignoreWarnings: [/Failed to parse source map/],
  devtool: false,
  resolve: {
    fallback: {
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util/"),
      "zlib": require.resolve("browserify-zlib"),
      "assert": require.resolve("assert/"),
      "url": require.resolve("url/")
    }
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()]
  },
  plugins: [
    new NodePolyfillPlugin() 
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"]
          }
        }
      }
    ]
  }
};

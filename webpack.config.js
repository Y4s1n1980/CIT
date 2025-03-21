const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    ignoreWarnings: [/Failed to parse source map/, /Critical dependency: the request of a dependency is an expression/],

  devtool: false,  
  resolve: {

    alias: {
        'peerjs':'peerjs/dist/peerjs.js'
      },
      fallback: {
          "http": require.resolve("stream-http"),
          "https": require.resolve("https-browserify"),
          "stream": require.resolve("stream-browserify"),
          "util": require.resolve("util/"),
          "zlib": require.resolve("browserify-zlib"),
          "assert": require.resolve("assert/"),
          "url": require.resolve("url/"),
          "http": require.resolve("stream-http")
      }
  },

  
  plugins: [
      new NodePolyfillPlugin(), 
  ],
  module: {
      rules: [
          {
              test: /\.(js|jsx)$/,
              exclude: /node_modules\/peerjs/ ,
              use: {
                  loader: "babel-loader",
                  options: {
                      presets: ["@babel/preset-env", "@babel/preset-react"]
                  },
              },
          },
      ],
  },
};

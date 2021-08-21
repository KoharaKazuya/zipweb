const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { GenerateSW } = require("workbox-webpack-plugin");

/** @type import('webpack').Configuration */
module.exports = {
  mode: "development",

  output: {
    path: path.join(process.cwd(), "dist"),
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HTMLPlugin({
      template: path.join(__dirname, "src/index.html"),
    }),
    new CopyPlugin({
      patterns: ["public"],
    }),
    new GenerateSW(),
  ],
};

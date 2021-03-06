const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

require("dotenv").config({ path: "src/.env" });

var path = require("path");

const PORT = 8000;

if (!process.env.FLAVOR) {
  process.exitCode = 1;
  process.exit();
}

const isProd = process.env.NODE_ENV === "production";

const outputPath = path.resolve(__dirname, "www");

const gitSha = require("child_process")
  .execSync("git rev-parse HEAD")
  .toString();

var entryPoints = [
  "@babel/polyfill",
  "whatwg-fetch",
  "normalize.css",
  "./src/base/static/index.tsx",
  "./src/flavors/" + process.env.FLAVOR + "/static/css/custom.css",
];

const extractSCSS = new MiniCssExtractPlugin({
  // Options similar to the same options in webpackOptions.output
  // both options are optional
  filename: isProd ? "[name].[hash].bundle.css" : "[name].bundle.css",
  chunkFilename: isProd ? "[id].[hash].bundle.css" : "[id].bundle.css",
});

module.exports = {
  mode: isProd ? "production" : "development",
  entry: entryPoints,
  output: {
    path: outputPath,
    // use this for our dynamic imports, like "1.bundle.js"
    chunkFilename: "[chunkhash].bundle.js",
    filename: isProd ? "[chunkhash].main.bundle.js" : "main.bundle.js",
    // Support dynamic imports from nested routes.
    // See: https://github.com/webpack/webpack/issues/7417
    publicPath: "/",
  },
  resolve: {
    alias: {
      // alias for our config:
      config: path.resolve(
        __dirname,
        "src/flavors",
        process.env.FLAVOR,
        "config.json",
      ),
    },
    extensions: [".wasm", ".mjs", ".js", ".json", ".ts", ".tsx"],
  },
  resolveLoader: {
    modules: ["node_modules", path.resolve(__dirname, "scripts")],
  },
  module: {
    // https://github.com/mapbox/mapbox-gl-js/issues/4359#issuecomment-28800193
    noParse: /(mapbox-gl)\.js$/,
    rules: [
      {
        test: /\.modernizrrc\.js$/,
        loader: "webpack-modernizr-loader",
      },
      {
        test: /locales/,
        loader: "i18next-resource-store-loader",
        query: {
          include: /\.json$/,
        },
      },
      {
        test: /\.s?css$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader?url=false",
          {
            loader: "sass-loader",
            options: {
              includePaths: [
                path.resolve(__dirname, "./node_modules/compass-mixins/lib"),
                path.resolve(__dirname, "./src/base/static/stylesheets/util"),
                path.resolve(
                  __dirname,
                  "./src/base/static/stylesheets/themes",
                  "default-theme",
                ),
              ],
            },
          },
        ],
      },
      {
        test: /config\.json$/,
        use: ["config-loader", "json-loader"],
      },
      {
        test: /\.svg$/,
        loader: "svg-inline-loader",
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            // This is a feature of `babel-loader` for webpack (not Babel itself).
            // It enables caching results in ./node_modules/.cache/babel-loader/
            // directory for faster rebuilds.
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        enforce: "pre",
        use: [
          {
            loader: "source-map-loader",
          },
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
            },
          },
        ],
      },
    ],
  },
  node: {
    fs: "empty",
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": isProd
        ? JSON.stringify("production")
        : JSON.stringify("dev"),
      MAP_PROVIDER_TOKEN: JSON.stringify(process.env.MAP_PROVIDER_TOKEN),
      GIT_SHA: JSON.stringify(gitSha),
      MIXPANEL_TOKEN: JSON.stringify(process.env.MIXPANEL_TOKEN),
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    extractSCSS,
    new CompressionPlugin(),
    new WorkboxPlugin.InjectManifest({
      swSrc: path.join("src", "sw.js"),
      swDest: path.join(outputPath, "service-worker.js"),
    }),
  ],
  devtool: isProd ? false : "cheap-eval-souce-map",
  devServer: {
    contentBase: outputPath,
    historyApiFallback: {
      disableDotRule: true,
    },
    compress: true,
    port: PORT,
    allowedHosts: [".ngrok.io"],
  },
};

// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// This provides polyfills for native node modules that are not supported in React Native.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules, // Preserve any other existing extraNodeModules
  stream: require.resolve("readable-stream"),
  http: require.resolve("stream-http"),
  https: require.resolve("https-browserify"),
  url: require.resolve("url"),
  crypto: require.resolve("react-native-crypto"),
  zlib: require.resolve("browserify-zlib"),
  net: path.resolve(__dirname, "shim.js"), // Shim for 'net' module
  tls: path.resolve(__dirname, "shim.js"), // Shim for 'tls' module
  // Add 'assert' or 'util' if you encounter errors with them
  // assert: require.resolve('assert'),
  // util: require.resolve('util'),
};

module.exports = config;

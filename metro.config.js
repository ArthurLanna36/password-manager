// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path"); // Adicione esta linha

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules, // Mantém outras configurações existentes
  stream: require.resolve("readable-stream"),
  http: require.resolve("stream-http"),
  https: require.resolve("https-browserify"),
  url: require.resolve("url"),
  crypto: require.resolve("react-native-crypto"),
  zlib: require.resolve("browserify-zlib"),
  net: path.resolve(__dirname, "shim.js"), // Modificado para usar o shim.js
  tls: path.resolve(__dirname, "shim.js"), // Adicionado para usar o shim.js
  // Se 'assert' ou 'util' derem erro e não estiverem na lista, adicione:
  // assert: require.resolve('assert'),
  // util: require.resolve('util'),
};

module.exports = config;

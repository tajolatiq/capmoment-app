// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // only add .cjs (and .mjs if you need it)
  config.resolver.sourceExts.push("cjs");

  return config;
})();

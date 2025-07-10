// babel.config.js
// Place this at the root of your project (next to package.json)

module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo'
    ],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './'
          }
        }
      ],
      // This must be listed last for react-native-reanimated
      'react-native-reanimated/plugin'
    ]
  };
};

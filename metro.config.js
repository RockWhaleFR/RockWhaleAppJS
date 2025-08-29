// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // Pouvoir charger les fichiers .cjs
  config.resolver.sourceExts.push('cjs');

  // On enlève react-native de la liste des modules ignorés par Babel
  config.resolver.transformIgnorePatterns = [
    'node_modules/(?!(react-native|expo|@unimodules|react-native-reanimated)/)',
  ];

  return config;
})();

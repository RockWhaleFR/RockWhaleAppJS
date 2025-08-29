module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated doit rester en dernier
      'react-native-reanimated/plugin'
    ],
    overrides: [
      {
        // Tous les fichiers JS sous node_modules/react-native/Libraries/Animated
        test: /node_modules[/\\]react-native[/\\]Libraries[/\\]Animated/,
        plugins: [
          // 1) class fields
          ['@babel/plugin-proposal-class-properties', { loose: true }],
          // 2) méthodes privées
          ['@babel/plugin-proposal-private-methods', { loose: true }],
        ],
      },
    ],
  };
};

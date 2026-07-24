module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Avec des dépendances stables, 'babel-preset-expo' gère
      // automatiquement tous les plugins nécessaires.
    ],
  };
};
/** @param {{ config: import('expo/config').ExpoConfig }} ctx */
module.exports = ({ config }) => {
  const profile = process.env.EAS_BUILD_PROFILE;
  const usesCleartextTraffic = profile !== 'production' && profile !== 'preview';

  const plugins = [...(config.plugins ?? [])];

  if (!plugins.includes('expo-localization')) {
    plugins.push('expo-localization');
  }

  if (!plugins.includes('@react-native-community/datetimepicker')) {
    plugins.push('@react-native-community/datetimepicker');
  }

  const buildPropsIndex = plugins.findIndex(
    (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-build-properties'
  );

  const buildPropsPlugin = [
    'expo-build-properties',
    {
      android: {
        usesCleartextTraffic,
      },
    },
  ];

  if (buildPropsIndex >= 0) {
    plugins[buildPropsIndex] = buildPropsPlugin;
  } else {
    plugins.splice(1, 0, buildPropsPlugin);
  }

  return {
    ...config,
    plugins,
  };
};

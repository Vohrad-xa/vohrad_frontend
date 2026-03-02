const {getDefaultConfig} = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..', '..');

const rootNodeModules = path.join(monorepoRoot, 'node_modules');
const mobileNodeModules = path.join(projectRoot, 'node_modules');

const config = getDefaultConfig(projectRoot);

config.watchFolders = Array.from(
  new Set([...(config.watchFolders ?? []), monorepoRoot]),
);

const {transformer, resolver} = config;
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

config.resolver = {
  ...(resolver || {}),
  nodeModulesPaths: [mobileNodeModules, rootNodeModules],
  resolverMainFields: ['react-native', 'browser', 'main'],
  unstable_conditionsByPlatform: {
    ...(resolver?.unstable_conditionsByPlatform || {}),
    web: ['default', 'browser', 'react-native'],
  },
  assetExts: (resolver?.assetExts ?? []).filter((ext) => ext !== 'svg'),
  sourceExts: [...(resolver?.sourceExts ?? []), 'svg'],
};

module.exports = config;

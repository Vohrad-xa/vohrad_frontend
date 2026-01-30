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

config.resolver = {
  ...(config.resolver || {}),
  nodeModulesPaths: [mobileNodeModules, rootNodeModules],
  resolverMainFields: ['react-native', 'browser', 'main'],
  unstable_conditionsByPlatform: {
    ...(config.resolver?.unstable_conditionsByPlatform || {}),
    web: ['default', 'browser', 'react-native'],
  },
};

module.exports = config;

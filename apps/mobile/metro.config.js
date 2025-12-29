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
  resolverMainFields: ['react-native', 'browser', 'main'],
  extraNodeModules: {
    ...(config.resolver?.extraNodeModules || {}),
    react: path.join(rootNodeModules, 'react'),
    'react-dom': path.join(rootNodeModules, 'react-dom'),
    'react-native': path.join(rootNodeModules, 'react-native'),
    '@tanstack/react-query': path.join(
      mobileNodeModules,
      '@tanstack/react-query',
    ),
  },
  unstable_enableSymlinks: true,
  unstable_conditionsByPlatform: {
    ...(config.resolver?.unstable_conditionsByPlatform || {}),
    web: ['default', 'browser', 'react-native'],
  },
};

try {
  const storeRoot = path.resolve(projectRoot, '..', '..', 'packages', 'store');
  const zustandPkg = require.resolve('zustand/package.json', {
    paths: [storeRoot],
  });
  const zustandDir = path.dirname(zustandPkg);
  const zustandCjs = path.join(zustandDir, 'index.js');
  const zustandMiddlewareCjs = path.join(zustandDir, 'middleware.js');
  const zustandVanillaCjs = path.join(zustandDir, 'vanilla.js');
  const zustandShallowCjs = path.join(zustandDir, 'shallow.js');
  const zustandContextCjs = path.join(zustandDir, 'context.js');

  config.resolver = {
    ...(config.resolver || {}),
    alias: {
      ...(config.resolver?.alias || {}),
      zustand: zustandCjs,
      'zustand/esm': zustandCjs,
      'zustand/middleware': zustandMiddlewareCjs,
      'zustand/esm/index.mjs': zustandCjs,
      'zustand/esm/middleware.mjs': zustandMiddlewareCjs,
      'zustand/esm/vanilla.mjs': zustandVanillaCjs,
      'zustand/esm/shallow.mjs': zustandShallowCjs,
      'zustand/esm/context.mjs': zustandContextCjs,
    },
  };
} catch (_e) {
  // proceed with defaults
}

module.exports = config;

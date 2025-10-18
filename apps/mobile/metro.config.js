const {getDefaultConfig} = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..', '..');
const rootNodeModules = path.join(monorepoRoot, 'node_modules');

// Expo default + targeted alias to force Zustand CJS on web to avoid import.meta
const config = getDefaultConfig(projectRoot);

config.watchFolders = Array.from(
  new Set([...(config.watchFolders ?? []), monorepoRoot]),
);

try {
  const zustandPkg = require.resolve('zustand/package.json');
  const zustandDir = path.dirname(zustandPkg);
  const zustandCjs = path.join(zustandDir, 'index.js');
  const zustandMiddlewareCjs = path.join(zustandDir, 'middleware.js');
  const zustandVanillaCjs = path.join(zustandDir, 'vanilla.js');
  const zustandShallowCjs = path.join(zustandDir, 'shallow.js');
  const zustandContextCjs = path.join(zustandDir, 'context.js');

  config.resolver = {
    ...(config.resolver || {}),
    resolverMainFields: ['react-native', 'browser', 'main'],
    extraNodeModules: {
      ...(config.resolver?.extraNodeModules || {}),
      react: path.join(rootNodeModules, 'react'),
      'react-dom': path.join(rootNodeModules, 'react-dom'),
      'react-native': path.join(rootNodeModules, 'react-native'),
    },
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
    unstable_enableSymlinks: true,
    unstable_conditionsByPlatform: {
      ...(config.resolver?.unstable_conditionsByPlatform || {}),
      web: ['default', 'browser', 'react-native'],
    },
  };
} catch (_e) {
  // proceed with defaults
}

module.exports = config;

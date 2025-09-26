const {getDefaultConfig} = require('expo/metro-config');
const path = require('path');

// Expo default + targeted alias to force Zustand CJS on web to avoid import.meta
const config = getDefaultConfig(__dirname);

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
    unstable_conditionsByPlatform: {
      ...(config.resolver?.unstable_conditionsByPlatform || {}),
      web: ['default', 'browser', 'react-native'],
    },
  };
} catch (_e) {
  // proceed with defaults
}

module.exports = config;

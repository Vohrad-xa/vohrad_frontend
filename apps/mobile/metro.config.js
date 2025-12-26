const {getDefaultConfig} = require('expo/metro-config');
const path = require('path');
const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

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

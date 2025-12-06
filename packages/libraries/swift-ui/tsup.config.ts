import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/swift-ui/index.tsx'],
  format: ['esm', 'cjs'],
  dts: options.watch ? false : true,
  sourcemap: true,
  clean: options.watch ? false : true,
  target: 'es2019',
  platform: 'neutral',
  treeshake: true,
  minify: false,
  external: [
    'react',
    'react-native',
    'expo',
    'expo-modules-core',
    'sf-symbols-typescript',
  ],
  outExtension: ({ format }) => ({ js: format === 'cjs' ? '.cjs' : '.mjs' }),
}));

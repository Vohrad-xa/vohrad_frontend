import {defineConfig} from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
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
    '@sykamore/store',
    '@sykamore/api-client',
    '@sykamore/types',
  ],
  outExtension: ({format}) => ({js: format === 'cjs' ? '.cjs' : '.mjs'}),
}));

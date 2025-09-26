import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2019',
  platform: 'neutral',
  treeshake: true,
  minify: false,
  external: ['zustand', 'react', 'react-native', 'expo', '@vohrad/types'],
  outExtension: ({format}) => ({js: format === 'cjs' ? '.cjs' : '.mjs'}),
});

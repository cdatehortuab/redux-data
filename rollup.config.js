import _defaultsDeep from 'lodash/defaultsDeep';
import _union from 'lodash/union';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

const MODULE_NAME = 'ReduxData';

const minifier = terser({
  sourcemap: true,
});

const typescripter = typescript({
  useTsconfigDeclarationDir: true,
});

const dependencies = Object.keys(pkg.dependencies || {});
const peerDependencies = Object.keys(pkg.peerDependencies || {});

const defaults = {
  input: 'src/index.ts',
  plugins: [
    typescripter,
  ],
  external: [
    ...peerDependencies,
  ],
};

function createConfig(options) {
  const {
    prePlugins = [],
    postPlugins = [],
    plugins = [],
    external = [],
    ...restOptions
  } = options;

  const config = _defaultsDeep(restOptions, defaults);

  config.plugins.unshift(...prePlugins);
  config.plugins.push(...plugins);
  config.plugins.push(...postPlugins);

  config.external = _union(config.external, external);

  return config;
}

export default [
  // CommonJS
  createConfig({
    output: {
      file: pkg.main,
      format: 'cjs',
    },
    external: [
      dependencies
    ],
  }),

  // ES
  createConfig({
    output: {
      file: pkg.module,
      format: 'es',
    },
    external: [
      dependencies
    ],
  }),

  // ES for Browsers
  createConfig({
    output: {
      file: pkg.module.replace(/\.js$/, '.mjs'),
      format: 'es',
    },
    postPlugins: [
      minifier,
    ],
  }),

  // UMD Development
  createConfig({
    output: {
      file: pkg.unpkg,
      format: 'umd',
      name: MODULE_NAME,
      indent: false,
    },
  }),

  // UMD Production
  createConfig({
    output: {
      file: pkg.unpkg.replace(/\.js$/, '.min.js'),
      format: 'umd',
      name: MODULE_NAME,
      indent: false,
    },
    postPlugins: [
      minifier,
    ],
  }),
];

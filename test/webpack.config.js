import path from 'node:path';
import TerserPlugin from 'terser-webpack-plugin';
import WebpackExtensionManifestPlugin from 'webpack-extension-manifest-plugin';

import * as Manifest from './src/manifest.js';

export default function(env) {
  const manifest = Manifest.get(env.m2 ? 2 : 3);

  return {
    entry: {
      content: path.resolve('src', 'content.js'),
      agent: path.resolve('src', 'agent.js'),
      bg: path.resolve('src', 'bg.js')
    },
    output: {
      path: path.resolve('build'),
      filename: '[name].js',
      clean: true
    },

    plugins: [
      new WebpackExtensionManifestPlugin({
        config: manifest,
        minify: false
      })
    ],
    
    mode: 'development',
    devtool: 'source-map',
    optimization: {
      minimize: false,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: { format: { comments: false } }
        })
      ]
    }
  };
};
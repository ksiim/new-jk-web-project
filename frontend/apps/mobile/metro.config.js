const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const zustandPkgJson = require.resolve('zustand/package.json', {
  paths: [__dirname],
});
const zustandRoot = path.dirname(zustandPkgJson);
const zustandMiddlewareCjs = path.join(zustandRoot, 'middleware.js');
const zustandMiddlewareDir = path.join(zustandRoot, 'middleware');

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'zustand/middleware' ||
    moduleName === 'zustand/middleware/'
  ) {
    return { type: 'sourceFile', filePath: zustandMiddlewareCjs };
  }

  if (moduleName.startsWith('zustand/middleware/')) {
    const sub = moduleName.slice('zustand/middleware/'.length);
    return {
      type: 'sourceFile',
      filePath: path.join(zustandMiddlewareDir, `${sub}.js`),
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

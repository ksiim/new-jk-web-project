// babel-plugin-transform-import-meta — страховка: убивает `import.meta`
// в коде пользователя. Для node_modules (например zustand/esm) Metro не
// прогоняет babel, поэтому zustand/middleware дополнительно переадресован
// на CJS-версию в metro.config.js.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['babel-plugin-transform-import-meta'],
  };
};

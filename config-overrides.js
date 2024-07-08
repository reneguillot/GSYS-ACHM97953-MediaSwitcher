const { override, addWebpackResolve } = require('customize-cra');

module.exports = override( addWebpackResolve({ fallback: { os: false, path: false, zlib: false, http: false, https: false, fs: false, }, }) );

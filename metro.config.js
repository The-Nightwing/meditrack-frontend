const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Include .mjs files so zustand's ESM files are resolved and transformed
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

// Transform zustand's .mjs files through Babel so import.meta gets replaced
config.transformer.transformIgnorePatterns = [
  'node_modules/(?!(zustand)/)',
];

module.exports = config;

export default {
  preset: 'ts-jest/presets/default-esm', // preset para ESM
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: ['**/tests/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  clearMocks: true,
  testTimeout: 120000,
  verbose: true,
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};
module.exports = {
  preset: 'ts-jest',
  rootDir: './',
  testRegex: '(/test/.*\\.(test|spec))\\.[tj]sx?$',
  moduleFileExtensions: [
      "ts",
      "tsx",
      "js",
      "jsx"
  ],
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
  // testSequencer: "<rootDir>/test/testSequencer.js"
};
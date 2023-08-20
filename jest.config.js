module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: [
      "**/__tests__/**/*.ts",
      "**/?(*.)+(spec|test).ts"
    ],
    moduleFileExtensions: [
      "ts",
      "tsx",
      "js"
    ],
    // Any other configurations you'd like to add.
  };
  
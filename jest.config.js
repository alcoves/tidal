module.exports = {
  verbose: true,
  "roots": [
    "<rootDir>"
  ],
  "testMatch": [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  "testPathIgnorePatterns": [
    "dist"
  ],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
}
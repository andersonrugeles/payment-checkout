module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-redux|@reduxjs/toolkit|immer|reselect|redux|redux-thunk)/)',
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^axios$': '<rootDir>/node_modules/axios/dist/node/axios.cjs',
  },
  setupFiles: ['./jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/types/**',
    '!src/navigation/**',
    '!src/screens/CheckoutScreen.tsx',
  ],
};

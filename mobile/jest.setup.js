jest.mock('react-native-encrypted-storage', () =>
  require('./__mocks__/react-native-encrypted-storage'),
);

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}) => children,
  useNavigation: () => ({navigate: jest.fn(), goBack: jest.fn()}),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({children}) => children,
    Screen: ({children}) => children,
  }),
}));

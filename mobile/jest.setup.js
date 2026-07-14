jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(()=> Promise.resolve()),
  getItem: jest.fn(()=> Promise.resolve(null)),
  removeItem: jest.fn(()=> Promise.resolve()),
  clear: jest.fn(()=> Promise.resolve()),
}));

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

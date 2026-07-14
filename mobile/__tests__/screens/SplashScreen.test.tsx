import React from 'react';
import renderer, {act} from 'react-test-renderer';
import SplashScreen from '../../src/screens/SplashScreen';

describe('SplashScreen', () => {
  const mockNavigation = {replace: jest.fn()};

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render correctly', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(<SplashScreen navigation={mockNavigation} />);
    });
    const instance = tree.root;
    const texts = instance.findAllByType('Text');
    const textContents = texts.map((t: any) => {
      try {
        return t.props.children;
      } catch {
        return '';
      }
    });
    expect(textContents).toContain('PayFlow');
    expect(textContents).toContain('Checkout de Pago Seguro');
  });

  it('should navigate to Home after timeout', () => {
    act(() => {
      renderer.create(<SplashScreen navigation={mockNavigation} />);
    });
    expect(mockNavigation.replace).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(mockNavigation.replace).toHaveBeenCalledWith('Home');
  });

  it('should not navigate before timeout', () => {
    act(() => {
      renderer.create(<SplashScreen navigation={mockNavigation} />);
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });
});

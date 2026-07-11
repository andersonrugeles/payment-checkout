import React, {useEffect} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';

interface Props {
  navigation: any;
}

const SplashScreen: React.FC<Props> = ({navigation}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💳</Text>
      <Text style={styles.brandName}>PayFlow</Text>
      <Text style={styles.subtitle}>Checkout de Pago Seguro</Text>
      <ActivityIndicator
        size="large"
        color="#6C63FF"
        style={styles.spinner}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
  },
  title: {
    fontSize: 64,
    marginBottom: 16,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0B0',
    marginBottom: 40,
  },
  spinner: {
    marginTop: 20,
  },
});

export default SplashScreen;

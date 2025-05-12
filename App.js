import React from 'react';
import { AuthProvider } from './configs/MyContexts';
import AppNavigator from './navigation/AppNavigator';
import { StyleSheet } from 'react-native';


export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

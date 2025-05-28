// App.js
import React, { useState } from 'react';
import { MyUserContext } from './configs/MyContexts';
import AppNavigator from './navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  return (
    <SafeAreaProvider>
      <MyUserContext.Provider value={{ loggedInUser, setLoggedInUser }}>
        <AppNavigator />
      </MyUserContext.Provider>
    </SafeAreaProvider>
  );
}

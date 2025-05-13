import React, { useState } from 'react';
import { MyUserContext } from './configs/MyContexts';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  return (
    <MyUserContext.Provider value={{ loggedInUser, setLoggedInUser }}>
      <AppNavigator />
    </MyUserContext.Provider>
  );
}

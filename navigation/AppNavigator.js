import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Welcome from '../components/User/Welcome';
import Login from '../components/User/Login';
import Register from '../components/User/Register';
import Home from '../components/Home/Home';
import { MyUserContext } from '../configs/MyContexts';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { loggedInUser } = useContext(MyUserContext);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {loggedInUser ? (
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

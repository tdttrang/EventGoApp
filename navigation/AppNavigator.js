import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Welcome from '../components/User/Welcome';
import Login from '../components/User/Login';
import Register from '../components/User/Register';
import Home from '../components/Home/Home';
import EventDetails from '../components/Event/EventDetails';
import Search from '../components/Home/Search';
import AuthStack from '../navigation/AuthStack';
import AppStack from '../navigation/AppStack';
import { authApi, endpoints } from '../configs/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyUserContext } from '../configs/MyContexts';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {

//   const { loggedInUser, setLoggedInUser } = useContext(MyUserContext);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//   const checkLogin = async () => {
//     try {
//       const token = await AsyncStorage.getItem('access');
//       if (token) {
//         const res = await authApi(token).get(endpoints.currentUser);
//         setLoggedInUser({
//           token,
//           ...res.data,
//         });
//       }
//     } catch (err) {
//       console.error("Lỗi khi lấy thông tin user:", err);
//       await AsyncStorage.removeItem('access');
//     } finally {
//       setLoading(false);
//     }
//   };

//   checkLogin();
// }, []);

//   if (loading) {
//   return null; // Hoặc trả về <ActivityIndicator />
// }


  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home' screenOptions={{ headerShown: false }}>
        {/* {loggedInUser ? (
          // Đã đăng nhập → chỉ cho vào Home
                    <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />

        ) : (
          // Chưa đăng nhập → Welcome/Login/Register
          <>
                        <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />

            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
          </>
        )} */}
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="EventDetails" component={EventDetails} />
        <Stack.Screen name="Search" component={Search} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

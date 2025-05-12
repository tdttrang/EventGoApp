// components/User/Login.js
import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import { AuthEndpoints } from '../../configs/Apis';
import { AuthContext } from '../../configs/MyContexts';

const Login = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(AuthEndpoints.LOGIN, { email, password });
      await login(response.data.token); // Assuming your context has a login function
      navigation.replace('Home'); // Navigate to Home after successful login
    } catch (error) {
      Alert.alert('Login failed', 'Invalid credentials or network error');
    }
  };

  return (
    <View>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

export default Login;

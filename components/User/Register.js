import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../../styles/MyStyles';
import { API_BASE_URL } from '../../configs/Apis';
import { UserContext } from '../../configs/MyContexts';

const Register = () => {
  const navigation = useNavigation();
  const { setUserData_75_Trang } = useContext(UserContext);

  const [username_75_Trang, setUsername_75_Trang] = useState('');
  const [email_75_Trang, setEmail_75_Trang] = useState('');
  const [password_75_Trang, setPassword_75_Trang] = useState('');
  const [confirmPassword_75_Trang, setConfirmPassword_75_Trang] = useState('');

  const handleRegister_75_Trang = async () => {
    if (!username_75_Trang || !email_75_Trang || !password_75_Trang || !confirmPassword_75_Trang) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (password_75_Trang !== confirmPassword_75_Trang) {
      Alert.alert('Lỗi', 'Mật khẩu không khớp.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register/`, {
        username: username_75_Trang,
        email: email_75_Trang,
        password: password_75_Trang,
      });

      Alert.alert('Thành công', 'Đăng ký thành công. Hãy đăng nhập.');
      navigation.navigate('Login');
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', error.response?.data?.detail || 'Đăng ký thất bại.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký tài khoản</Text>

      <TextInput
        style={styles.input}
        placeholder="Tên người dùng"
        value={username_75_Trang}
        onChangeText={setUsername_75_Trang}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email_75_Trang}
        onChangeText={setEmail_75_Trang}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password_75_Trang}
        onChangeText={setPassword_75_Trang}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Xác nhận mật khẩu"
        value={confirmPassword_75_Trang}
        onChangeText={setConfirmPassword_75_Trang}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister_75_Trang}>
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Register;

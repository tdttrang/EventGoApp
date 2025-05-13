import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { MyUserContext } from '../../configs/MyContexts';

const Register = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setLoggedInUser } = useContext(MyUserContext);

  const handleRegister = () => {
    if (email && password) {
      // Giả lập đăng ký thành công
      setLoggedInUser({ email });  // lưu thông tin user vào context
    } else {
      alert('Vui lòng nhập email và mật khẩu.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Đăng ký</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Mật khẩu" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <Button title="Đăng ký" onPress={handleRegister} />
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, marginVertical: 10, padding: 10, borderRadius: 5 },
  label: { fontSize: 20, marginBottom: 20, textAlign: 'center' }
});

import React, { useContext, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { MyUserContext } from '../../configs/MyContexts';

const Home = ({ navigation }) => {
  const { loggedInUser } = useContext(MyUserContext);

  useEffect(() => {
    if (!loggedInUser) {
      // Nếu chưa đăng nhập thì chuyển về màn hình chào mừng
      navigation.replace('Welcome');
    }
  }, [loggedInUser]);

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Chào mừng, {loggedInUser?.email}!</Text>
      <Text style={styles.title}>Đây là trang chủ.</Text>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  welcomeText: { fontSize: 18, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' }
});

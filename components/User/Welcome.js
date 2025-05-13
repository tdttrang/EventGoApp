import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import MyStyles from "../../styles/MyStyles";
import { colors } from "../../utils/colors"
import { fonts } from "../../utils/fonts"
import { useNavigation } from '@react-navigation/native';

const Welcome = () => {
    const navigation = useNavigation();

    const handleLogin = () => {
        navigation.navigate("Login");
    }

    const handleSignup = () => {
        navigation.navigate("Register");
    }


  return (
    <SafeAreaView style ={MyStyles.container}>
      <Image source={require("../../assets/Logo.png")} style={styles.logo} />
      <Image  source={require("../../assets/welcome.png")} style={styles.bannerImage}/>
      <Text style={styles.title}>Welcome to EventGo!</Text>
      <Text style={styles.subTitle}>
        Ứng dụng đặt vé sự kiện nhanh chóng, tiện lợi và an toàn.
        Bắt đầu hành trình trải nghiệm sự kiện ngay hôm nay!
      </Text>

      <View style={styles.buttonContainer}>
      <TouchableOpacity style= {[styles.loginButton,
      { backgroundColor: colors.green }
      ]}
      onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style= {styles.loginButton} onPress={handleSignup}>
        <Text style={styles.signupText}>Sign up</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  logo: {
    height: 40,
    width: 160,
    marginTop: 80,
    resizeMode: "contain",
    alignSelf: "center"
  },
  bannerImage:  {
    marginVertical: 25,
    height: 250,
    width: 231,
  },
  title: {
    fontSize: 30,
    fontFamily: fonts.SemiBold,
    paddingHorizontal: 20,
    textAlign: "center",
    color: colors.primary,
    marginTop: 40
  },
  subTitle: {
    fontSize: 16,
    color: colors.secondary,
    fontFamily: fonts.Medium,
    paddingHorizontal: 20,
    marginVertical: 20,
    textAlign: "center"
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    borderWidth: 2,
    borderColor: colors.primary,
    width: "80%",
    height: 60,
    borderRadius: 100, 
    overflow: "hidden"
  },
  loginButton: {
    justifyContent: "center",
    alignItems: "center",
    width: "50%",
    //flex: 1,
    borderRadius: 98
  },
  loginText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fonts.SemiBold
  },
  signupText: {
    fontSize: 18,
    fontFamily: fonts.SemiBold
  }
})

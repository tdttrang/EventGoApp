import React, {useState} from "react";
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Image } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { colors } from "../../utils/colors"
import { fonts } from "../../utils/fonts"
import Ionicons from "react-native-vector-icons/Ionicons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import { useNavigation } from "@react-navigation/native";

const Login = () => {
  const navigation = useNavigation();
  const [secureEntry, setSecureEntry] = useState(true);

  const handleSignup = () => {
    navigation.navigate("Register");
  }


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.textContainer}>
        <Text style ={styles.headingText}>Hey,</Text>
        <Text style ={styles.headingText}>Welcome</Text>
        <Text style ={styles.headingText}>Back</Text>
        
      </View>
      {/* form login*/}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name={"mail-outline"} size={25} color={colors.secondary} />
          <TextInput style={styles.textInput} 
          placeholder="Enter your email" placeholderTextColor={colors.secondary}
          keyboardType="email-address"/>
        </View>
        <View style={styles.inputContainer}>
          <SimpleLineIcons name={"lock"} size={25} color={colors.secondary} />
          <TextInput style={styles.textInput} 
          placeholder="Enter your passwod" placeholderTextColor={colors.secondary}
          secureTextEntry={secureEntry}/>
          <TouchableOpacity onPress={() => {
            setSecureEntry((prev) => !prev); 
          }}>
            <SimpleLineIcons name={"eye"} size={20} color={colors.secondary} />
          </TouchableOpacity>          
        </View>
        <TouchableOpacity>
          <Text style={styles.forgotPassText}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
        <Text style= {styles.continueText}>or continue with</Text>
        <TouchableOpacity style={styles.ggButton}>
          <Image source={require("../../assets/Social Icons.png")} style={styles.ggImage}/>
          <Text style={styles.ggText}>Google</Text>
        </TouchableOpacity>
        <View style={styles.footerContainer}>
          <Text style={styles.accountText}>Dont't have an account?</Text>
          <TouchableOpacity onPress={handleSignup}>
            <Text style={styles.signupText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: colors.white
  },
  textContainer: {
    marginTop: 20,
    alignSelf: "flex-start",
  },
  headingText: {
    fontSize: 32,
    color: colors.primary,
    fontWeight: "500"
  },
  formContainer: {
    marginTop: 20
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 100,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 2,
    marginVertical: 10,
  }, 
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    //fontFamily: fonts.Light,
    fontWeight: "300"
  },
  forgotPassText: {
    textAlign: "right",
    color: colors.primary,
    fontWeight: "500",
    marginVertical: 10,
  },
  loginButton: {
    backgroundColor: colors.green,
    borderRadius: 100,
    marginTop: 20,
  },
  loginText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    padding: 10,
  },
  continueText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 14,
    fontFamily: fonts.Regular,
    color: colors.primary
  },
  ggButton: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    gap: 10
  },
  ggImage: {
    height: 20,
    width: 20,
  },
  ggText: {
    fontSize: 20,
    fontWeight: "500",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    gap: 5
  },
  accountText: {
    color: colors.primary,
  },
  signupText: {
    color: colors.primary,
    fontWeight: "600"
  }

})

import React, {useState, useLayoutEffect, useEffect, useContext} from "react";
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { colors } from "../../utils/colors";
import { fonts } from "../../utils/fonts";
import Ionicons from "react-native-vector-icons/Ionicons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import { useNavigation } from "@react-navigation/native";
import { MyUserContext } from "../../configs/MyContexts";
import AsyncStorage from "@react-native-async-storage/async-storage";


const Login = () => {
  const navigation = useNavigation();
  const { setLoggedInUser } = useContext(MyUserContext);
  const [secureEntry, setSecureEntry] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  

  const [loading, setLoading] = useState(false);

   useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Login", // tiêu đề trang
      headerTitleAlign: "left",
      headerTintColor: colors.primary, // màu của mũi tên back
      headerBackTitleVisible: false,

    });
  }, [navigation]);

  const handleSignup = () => {
    navigation.navigate("Register");
  }

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.navigate("Welcome")}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} style={{ marginLeft: 1, marginRight: 10}} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);


  const handleLogin = async () => {
    if (username.trim() === "") {
      setUsernameError("Please enter your username");
      return;
    } else {
      setUsernameError("");
    }
    if (password.trim() === "") {
      setPasswordError("Please enter your password");
      return;
    } else {
      setPasswordError("");
    }
    setLoading(true);

    // Gọi API đăng nhập
    try {
      const response = await fetch("https://mynameisgiao.pythonanywhere.com/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
          client_id: "UqSAsdIfXHAG8tKL3bYsIGSa2kGJIsPhmTLhW7oT",
          client_secret: "ckJNtISlDERct7PiF9OSrJXPyQlE17GMlMuiPDM7ByZxNL9cIYTvv3P15XeJDiGd50MFF5PjspV7C990RPCcp4Tt5Hyk5HkODvk5kGFOiGKKPgy9D7pl4TkwerOEdfbk",
          grant_type: "password",
        }),
      });

      const data = await response.json();
      console.log("Login response:", data);
      if (response.ok) {
        await AsyncStorage.setItem("access", data.access_token);

        // Lấy thông tin người dùng từ endpoint /current-user/profile/
        const userResponse = await fetch("https://mynameisgiao.pythonanywhere.com/current-user/profile/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        });
        const userData = await userResponse.json();
        if (userResponse.ok) {
          const role = userData.role || "attendee"; // Mặc định là attendee
          if (!["admin", "organizer", "attendee"].includes(role)) {
            throw new Error("Vai trò không hợp lệ");
          }
          setLoggedInUser({
            token: data.access_token,
            role: role,
            ...userData,
          });
          Alert.alert(
            "Đăng nhập thành công!",
            `Chào mừng ${role === "admin" ? "Quản trị viên" : role === "organizer" ? "Nhà tổ chức" : "Người tham gia"}`
          );
          navigation.navigate("Home");
        } else {
          Alert.alert("Lỗi", userData.message || "Không thể lấy thông tin người dùng");
        }
      } else {
        Alert.alert("Đăng nhập thất bại", data.message || "Tên đăng nhập hoặc mật khẩu không đúng");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi, vui lòng thử lại sau");
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.textContainer}>
        <Text style ={styles.headingText}>Hey,</Text>
        <Text style ={styles.headingText}>Welcome</Text>
        <Text style ={styles.headingText}>Back</Text>
        
      </View>
      {/* form login*/}
      <View style={styles.formContainer}>
        {/* username */}
        <View style={styles.inputContainer}>
          <Ionicons name={"people-outline"} size={25} color={colors.secondary} />
          <TextInput style={styles.textInput} 
          placeholder="Enter your username"
          placeholderTextColor={colors.secondary}
          value={username}
          onChangeText={(text) => {setUsername(text);
          if (text.trim() === "") {
            setUsernameError("Please enter your username");
          } else {
            setUsernameError("");
          }
          }}
          />
          {usernameError !== "" && (
          <Text style={styles.errorText}>{usernameError}</Text>
        )}
        </View>

        {/* password */}
        <View style={styles.inputContainer}>
          <SimpleLineIcons name={"lock"} size={25} color={colors.secondary} />
          <TextInput style={styles.textInput} 
          placeholder="Enter your password"
          placeholderTextColor={colors.secondary}
          secureTextEntry={secureEntry}
          value={password}
          onChangeText={(text) => {setPassword(text);
          if (text.trim() === "") {
            setPasswordError("Please enter your password");
          } else {
            setPasswordError("");
          }
          } }
          />
          <TouchableOpacity onPress={() => {
            setSecureEntry((prev) => !prev); 
          }}>
            <SimpleLineIcons name={"eye"} size={20} color={colors.secondary} />
          </TouchableOpacity>          
        </View>

        {/* Forgot Password */}
        <TouchableOpacity>
          <Text style={styles.forgotPassText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
        <Text style= {styles.continueText}>or continue with</Text>
        <TouchableOpacity style={styles.ggButton}>
          <Image source={require("../../assets/Social Icons.png")} style={styles.ggImage}/>
          <Text style={styles.ggText}>Google</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.accountText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleSignup}>
            <Text style={styles.signupText}>Register</Text>
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

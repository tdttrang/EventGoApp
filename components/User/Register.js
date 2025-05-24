import React, {useState, useLayoutEffect, useEffect} from "react";
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { colors } from "../../utils/colors"
import { fonts } from "../../utils/fonts"
import Ionicons from "react-native-vector-icons/Ionicons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import { useNavigation } from "@react-navigation/native";
import { Picker } from '@react-native-picker/picker';
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

const Signup = () => {
  const navigation = useNavigation();
  const [secureEntry, setSecureEntry] = useState(true);

  // State variables for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("attendee"); // role default là attendee
  const [loading, setLoading] = useState(false); 
  const [errors, setErrors] = useState({});

  // chỉnh lại arrow
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.navigate("Welcome")}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} style={{ marginLeft: 1, marginRight: 10}} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);


  // validate 
  const validate = () => {
  const newErrors = {};

  if (!email.trim()) {
    newErrors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    newErrors.email = "Invalid email format";
  }

  if (!password.trim()) {
    newErrors.password = "Password is required";
  } else if (password.length < 6) {
    newErrors.password = "Password must be at least 6 characters";
  }

  if (!username.trim()) {
    newErrors.username = "Username is required";
  }

  setErrors(newErrors); // errors là useState({})
  return Object.keys(newErrors).length === 0;
};  

  const validateFields = (fieldName, value) => {
    let errorMessage = "";
    switch (fieldName) {
      case "email":
        if (!value.trim()) {
          errorMessage = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMessage = "Invalid email format";
        }
        break;
      case "password":
        if (!value.trim()) { 
          errorMessage = "Password is required";
        } else if (value.length < 6) {
          errorMessage = "Password must be at least 6 characters";
        }
        break;
      case "username":
        if (!value.trim()) {
          errorMessage = "Username is required";
        }
        break;
      case "role":
        if (!["attendee", "organizer"].includes(value)) {
          errorMessage = "Role is invalid";
        }
        break;
    }
    setErrors((prevErrors) => ({
      ...prevErrors, [fieldName]: errorMessage,
    }));
  };


  const handleSignup = async () => {
  const valid = validate();
  if (!valid) return;

  setLoading(true); // nếu bạn có loading indicator
  try {
    const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout 10s
      const response = await fetch(
        "https://mynameisgiao.pythonanywhere.com/auth/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            username,
            email,
            password,
            role,
            client_id: "UqSAsdIfXHAG8tKL3bYsIGSa2kGJIsPhmTLhW7oT",
            client_secret:
              "ckJNtISlDERct7PiF9OSrJXPyQlE17GMlMuiPDM7ByZxNL9cIYTvv3P15XeJDiGd50MFF5PjspV7C990RPCcp4Tt5Hyk5HkODvk5kGFOiGKKPgy9D7pl4TkwerOEdfbk",
            grant_type: "password",
          }).toString(),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      if (response.ok) {
        Alert.alert(
          "Đăng ký thành công",
          "Bạn đã đăng ký thành công. Vui lòng đăng nhập để tiếp tục.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      } else {
        let errorMessage = "Đã xảy ra lỗi khi đăng ký.";
        try {
          const errorData = JSON.parse(responseText);
          if (response.status === 400) {
            errorMessage =
              errorData.email?.[0] ||
              errorData.username?.[0] ||
              Object.values(errorData).join("\n") ||
              "Dữ liệu không hợp lệ.";
          } else if (response.status === 409) {
            errorMessage = "Email hoặc tên đăng nhập đã tồn tại.";
          }
        } catch (e) {
          errorMessage = responseText || "Đã xảy ra lỗi.";
        }
        Alert.alert("Đăng ký thất bại", errorMessage);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert(
        "Lỗi",
        error.name === "AbortError"
          ? "Yêu cầu quá thời gian, vui lòng thử lại."
          : "Đã xảy ra lỗi, vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

useLayoutEffect(() => {
  navigation.setOptions({
    headerShown: true,
    title: "Register",
    headerTitleAlign: "left",
    headerTintColor: colors.primary,
  });
}, [navigation]);



  const handleLogin = () => {
    navigation.navigate("Login");
  } 

  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.textContainer}>
        <Text style ={styles.headingText}>Let's get</Text>
        <Text style ={styles.headingText}>Started</Text>        
      </View>
      {/* form login*/}
      <View style={styles.formContainer}>

        {/* username */}
        <View style={styles.inputContainer}>
          <Ionicons name={"person-outline"} size={25} color={colors.secondary} />
          <TextInput  
          placeholder="Enter your username"
          placeholderTextColor={colors.secondary}
          style={[styles.textInput,
            errors.username && styles.inputError,
          ]}
          onChangeText={(text) => {
            setUsername(text);
            if (errors.username) {
              validateFields("username", text);
            }}}
          onBlur={() => validateFields("username", username)}
          value={username}
          />                  
        </View>
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
        
        {/* email */}
        <View style={styles.inputContainer}>
          <Ionicons name={"mail-outline"} size={25} color={colors.secondary} />
          <TextInput 
          placeholder="Enter your email"
          placeholderTextColor={colors.secondary}
          keyboardType="email-address"
          style={[
            styles.textInput,
            errors.email && styles.inputError,
          ]}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) {
              validateFields("email", text);
            }}
          }
          onBlur={() => validateFields("email", email)}
          value={email}
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        {/* password */}
        <View style={styles.inputContainer}>
          <SimpleLineIcons name={"lock"} size={25} color={colors.secondary} />
          <TextInput style={[
            styles.textInput,
            errors.password && styles.inputError,
          ]} 
          placeholder="Enter your passwod"
          placeholderTextColor={colors.secondary}
          secureTextEntry={secureEntry}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) {
              validateFields("password", text);
            }}}
          onBlur={() => validateFields("password", password)}
          value={password}
          />
          <TouchableOpacity onPress={() => {
            setSecureEntry((prev) => !prev); 
          }}>
            <SimpleLineIcons name={"eye"} size={20} color={colors.secondary} />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        {/* role */}
        <View style={styles.inputContainer}>
          <Ionicons name={"people-outline"} size={25} color={colors.secondary} />
          <Picker
            selectedValue={role}
            style={{ flex: 1, color: colors.secondary }}
            dropdownIconColor={colors.secondary}
            onValueChange={(itemValue) => setRole(itemValue)}
          >
            <Picker.Item label="attendee" value="attendee" />
            <Picker.Item label="organizer" value="organizer" />
          </Picker>
        </View>
            
        <TouchableOpacity style={styles.loginButton} onPress={handleSignup}>
          <Text style={styles.loginText}>Sign up</Text>
        </TouchableOpacity>

        <Text style= {styles.continueText}>or continue with</Text>
        <TouchableOpacity style={styles.ggButton}>
          <Image source={require("../../assets/Social Icons.png")} style={styles.ggImage}/>
          <Text style={styles.ggText}>Google</Text>
        </TouchableOpacity>
        <View style={styles.footerContainer}>
          <Text style={styles.accountText}>Already have an account!</Text>
        <TouchableOpacity onPress={handleLogin}>
          <Text style={styles.signupText}>Login</Text>
        </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: colors.white
  },
  textContainer: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  headingText: {
    fontSize: 32,
    color: colors.primary,
    fontWeight: "500"
  },
  formContainer: {
    marginTop: 10
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
  inputError: {
    borderColor: colors.red,
  },
  errorText: {  
    color: "red",
    fontSize: 12,
    marginLeft: 10,
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
    marginVertical: 15,
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

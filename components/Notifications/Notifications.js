import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../utils/colors";

const Notifications = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Đây là màn hình Thông báo</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C2526",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: colors.white,
    fontSize: 18,
  },
});

export default Notifications;
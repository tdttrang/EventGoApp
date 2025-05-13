import { StyleSheet } from "react-native";
import { colors } from "../utils/colors";
import { fonts } from "../utils/fonts"

export default StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: colors.white,
        alignItems: "center"
    }, event: {
        fontSize: 30,
        fontWeight: "bold",
        color: "blue"
    }
}) 
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTab from "./BottomTab";
import Search from "../components/Home/Search";
import EventDetails from "../components/Event/EventDetails";
import SelectTickets from "../components/Event/SelectTickets";
import TicketInfo from "../components/Event/TicketInfo";
import Payment from "../components/Event/Payment";
import Home from "../components/Home/Home";
import Tickets from "../components/Tickets/Tickets";
import Reviews from "../components/Event/ReviewsNReply";
import ManageEvents from "../components/Event/ManageEvents";
import Notifications from "../components/Notifications/Notifications";


const Stack = createNativeStackNavigator();

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BottomTab" component={BottomTab} />
    <Stack.Screen name="Search" component={Search} />
    <Stack.Screen name="EventDetails" component={EventDetails} />
    <Stack.Screen name="SelectTickets" component={SelectTickets} />
    <Stack.Screen name="TicketInfo" component={TicketInfo} />
    <Stack.Screen name="Payment" component={Payment} />
    <Stack.Screen name="Tickets" component={Tickets} />
    <Stack.Screen name="Home" component={Home} />
    <Stack.Screen name="Reviews" component={Reviews} />
    <Stack.Screen name="ManageEvents" component={ManageEvents} />
    <Stack.Screen name="Notifications" component={Notifications} />
  </Stack.Navigator>
);

export default AppStack;

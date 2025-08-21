import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import UsersScreen from "./components/UsersScreen";
import FormScreen from "./components/FormScreen";
import { MaterialIcons } from '@expo/vector-icons';




export type RootTabParamList = {
  Customers: undefined;
  AddCustomer: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Customers" component={UsersScreen} options={{tabBarIcon:({})=><MaterialIcons name="people" size={30}/>}} />
        <Tab.Screen name="AddCustomer" component={FormScreen} options={{tabBarIcon:()=><MaterialIcons name="person-add" size={30}/>}}/>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

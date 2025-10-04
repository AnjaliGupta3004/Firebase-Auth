/* Created by Anjali  Gupta on
 04-10-2025 */

 import { View, Text } from 'react-native'
 import React from 'react'
 import SignUpScreen from "../screens/SignUpScreen";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import 'react-native-get-random-values'


const Stack = createStackNavigator();

 const AppNavigator = () => {
   return (
    <NavigationContainer>

              <Stack.Navigator screenOptions={{ headerShown: false }}>

                          <Stack.Screen name="SignUpScreen" component={SignUpScreen} /> 

              </Stack.Navigator>
    </NavigationContainer>
   )
 }
 
 export default AppNavigator
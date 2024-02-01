import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import Home from '../Screens/Home';
import Splash from '../Screens/Splash';


export type RootStackParamList = {
    Root: any;
    Splash: undefined
};

const Main = () => {
    return (
        <NavigationContainer>
            <RootNavigator />
        </NavigationContainer>
    );
};

export default Main;

const Stack = createStackNavigator<RootStackParamList>();

function RootNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName='Splash'>
            <Stack.Screen name="Root" component={Home} />
            <Stack.Screen name="Splash" component={Splash} />
        </Stack.Navigator>
    );
}

import React, { useRef, useEffect } from 'react';
import { View, Image, Animated, Easing } from 'react-native';
import {ParamListBase,useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';


const Splash = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();

  useEffect(() => {
    const fadeInAnimation = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.ease,
      useNativeDriver: true,
    });

    const scaleAnimation = Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.ease,
      useNativeDriver: true,
    });

    const fadeOutAnimation = Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1500,
      easing: Easing.ease,
      useNativeDriver: true,
    });

    Animated.sequence([fadeInAnimation, scaleAnimation, fadeOutAnimation]).start(() => {
      // This callback will be invoked when the sequence animation is completed
      // You can navigate to the desired screen here
      navigation.replace('Root'); // Replace 'YourTargetScreen' with the actual screen name
    });

    // Ensure that the animation stops if the component unmounts
    return () => {
      fadeOutAnimation.stop();
      scaleAnimation.stop();
      fadeInAnimation.stop();
    };
  }, [fadeAnim, scaleAnim,]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.Image source={require("../assets/logo.png")} style={{width:75,height:75,opacity:fadeAnim,transform:[{
            scale:scaleAnim
        }]}}  />
      <Animated.Text
        style={{
          opacity: fadeAnim,
          fontSize: 38,
          transform: [
            {
              scale: scaleAnim,
            },
          ],
          color: '#895124',
          fontWeight: 'bold',
        }}
      >
        GULF Mall
      </Animated.Text>
    </View>
  );
};

export default Splash;

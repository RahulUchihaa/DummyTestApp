import React, { useRef, useEffect, useState } from 'react';
import { View, Image, Animated, Easing, PermissionsAndroid, Platform, Linking, Alert } from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AndroidLocationEnabler from 'react-native-android-location-enabler';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import { getLocation } from '../helpers/helper';
import Toast from 'react-native-toast-message';

interface Location {
  latitude: number;
  longitude: number;
  altitude: number | null;
}

interface CustomMarker {
  longitude: number;
  latitude: number;
  id: number;
  coordinates: Location;
  storeNumber: string;
  floorLevel: string;
}

const Splash = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const [markers, setMarkers] = useState<CustomMarker[]>([]);
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();

  useEffect(() => {
    const checkAndEnableLocation = async () => {
      if (Platform.OS === 'android') {
        try {
          const enableResult = await promptForEnableLocationIfNeeded();
          // Proceed only if the location is enabled
          if (enableResult === 'already-enabled' || enableResult === 'enabled') {
            startAnimations();
          } else {
            showAlert();
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(error.message);
            showAlert();
          }
        }
      }
    };

    checkAndEnableLocation();
  }, []);

  const startAnimations = async () => {
    try {
      const response = await getLocation();
      setMarkers(response);

      // Start animations
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
        // Navigate only when the animations are completed
        navigation.replace('Root', { marker: response });
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong while fetching the locations',
      });
    }
  };

  const showAlert = () => {
    Alert.alert(
      'Permission Request',
      'Please enable the permission to access the location & audio',
      [
        {
          text: 'Go to Settings',
          onPress: () => {
            Linking.openSettings();
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.Image
        source={require('../assets/logo.png')}
        style={{
          width: 75,
          height: 75,
          opacity: fadeAnim,
          transform: [
            {
              scale: scaleAnim,
            },
          ],
        }}
      />
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
        }}>
        GULF Mall
      </Animated.Text>
    </View>
  );
};

export default Splash;

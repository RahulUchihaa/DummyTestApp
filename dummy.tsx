import React, { useEffect, useState } from 'react';
import { View, Alert, Platform, StatusBar } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

interface Location {
  latitude: number;
  longitude: number;
}

const floorCoordinates = {
  ground: { latitude: 12.9592329, longitude: 77.5210428 },
  first: { latitude: 12.959226, longitude: 77.5210699 },
  second: { latitude: 12.9592343, longitude: 77.5210556 },
  third: { latitude: 12.9592362, longitude: 77.5210199 },
  // Add more floors as needed
};

const App: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  useEffect(() => {
    // Request location permission
    Geolocation.requestAuthorization();

    // Watch for location changes
    const watchId = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        checkFloor({ latitude, longitude });
      },
      error => console.log('Error getting location:', error),
      Platform.OS === 'android'
        ? {}
        : { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );

    return () => {
      // Clear the location watch when the component unmounts
      Geolocation.clearWatch(watchId);
    };
  }, []);

  const checkFloor = ({ latitude, longitude }: Location) => {
    const distances = Object.entries(floorCoordinates).map(
      ([floor, coordinates]) => {
        return {
          floor,
          distance: getDistanceFromLatLonInKm(
            latitude,
            longitude,
            coordinates.latitude,
            coordinates.longitude,
          ),
        };
      },
    );

    // Sort distances to find the closest floor
    distances.sort((a, b) => a.distance - b.distance);

    // Display the appropriate alert for the closest floor
    Alert.alert(`You are on the ${distances[0].floor} floor!`);
  };

  const getDistanceFromLatLonInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  return (
    <View style={{ flex: 1 }}>
       <StatusBar hidden />
      {currentLocation && (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}>
          {currentLocation && <Marker coordinate={currentLocation} />}
        </MapView>
      )}
    </View>
  );
};

export default App;

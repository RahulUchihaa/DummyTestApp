import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, Button, StyleSheet, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

interface Location {
  latitude: number;
  longitude: number;
}

interface CustomMarker {
  id: number;
  location: Location;
  storeNumber: string;
  floorLevel: string;
}

const App: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [markers, setMarkers] = useState<CustomMarker[]>([]);
  const [storeNumber, setStoreNumber] = useState<string>('');
  const [floorLevel, setFloorLevel] = useState<string>('');
  const [isModalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    // Request location permission
    Geolocation.requestAuthorization();

    // Watch for location changes
    const watchId = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        console.log(latitude, longitude);
        setCurrentLocation({ latitude, longitude });
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
  }, [currentLocation]);

  const showFormModal = () => setModalVisible(true);
  const hideFormModal = () => setModalVisible(false);

  const handleSave = () => {
    // Generate a unique id for the new marker
    const newMarkerId = Date.now();
    
    // Add the new marker to the array with the current location
    const newMarker: CustomMarker = {
      id: newMarkerId,
      location: currentLocation!,
      storeNumber,
      floorLevel,
    };
    setMarkers(prevMarkers => [...prevMarkers, newMarker]);

    // Clear the form input
    setStoreNumber('');
    setFloorLevel('');

    hideFormModal();
  };

  return (
    <View style={{ flex: 1 }}>
      {currentLocation && (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}>
          {markers.map(marker => (
            <Marker
              key={marker.id}
              coordinate={marker.location}
              title={marker.storeNumber}
              description={`Floor Level: ${marker.floorLevel}`}
            />
          ))}
        </MapView>
      )}

      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Store Number"
            value={storeNumber}
            onChangeText={text => setStoreNumber(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Floor Level"
            value={floorLevel}
            onChangeText={text => setFloorLevel(text)}
          />
          <Button title="Save" onPress={handleSave} />
          <Button title="Cancel" onPress={hideFormModal} />
        </View>
      </Modal>

      <TouchableOpacity style={styles.fab} onPress={showFormModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    backgroundColor: '#007bff',
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    right: 16,
    bottom: 16,
  },
  fabText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    elevation: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default App;

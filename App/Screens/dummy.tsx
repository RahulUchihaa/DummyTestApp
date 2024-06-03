import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import DropDownPicker from 'react-native-dropdown-picker';
import {getLocation, saveLocation} from '../helpers/helper';
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

const MapViewComponent: React.FC<{markers: CustomMarker[]}> = ({markers}) => {
  if (!Array.isArray(markers) || markers.length === 0) {
 
    return null;
  }

  return (
    <MapView
      style={styles.map}
      showsUserLocation={true}
      provider={"google"}
      followsUserLocation={true}
      initialRegion={{
        latitude: 12.9592528,
        longitude: 77.5210216,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}>
      {
      markers.length !== 0 ?
      markers.map(marker => {
        return (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker?.latitude,
              longitude: marker?.longitude,
            }}
            title={marker?.storeNumber}
            description={`Floor Level: ${marker?.floorLevel}`}
          />
        );
      }) : null}
    </MapView>
  );
};

const FormModal: React.FC<{
  isVisible: boolean;
  onClose: () => void;
  onSave: (storeNumber: string, floorLevel: string) => void;
}> = ({isVisible, onClose, onSave}) => {
  const [storeNumber, setStoreNumber] = useState<string>('');
  const [floorLevel, setFloorLevel] = useState<string>('');

  const [open, setOpen] = useState(false);
  const [items] = useState([
    {label: 'First Floor', value: '1'},
    {label: 'Second Floor', value: '2'},
    {label: 'Third Floor', value: '3'},
    {label: 'Fourth Floor', value: '4'},
    {label: 'Ground Floor', value: '0'},
  ]);

  const handleSave = () => {
    onSave(storeNumber, floorLevel);
    setStoreNumber('');
    setFloorLevel('');
    onClose();
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <TextInput
          style={styles.input}
          placeholder="Store Number"
          value={storeNumber}
          onChangeText={text => setStoreNumber(text)}
        />
        <DropDownPicker
          open={open}
          value={floorLevel}
          items={items}
          setOpen={setOpen}
          setValue={setFloorLevel}
          placeholder={'Select Floor Level'}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ... (imports)

// MapViewComponent and FormModal components are the same as in your original code

const Home: React.FC = ({route}) => {
  
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [markers, setMarkers] = useState<CustomMarker[]>([]);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);

  
 
  const watchLocation = () => {
    const watchId = Geolocation.watchPosition(
      position => {
        const {latitude, longitude, altitude} = position.coords;
        setCurrentLocation({latitude, longitude, altitude});
      },
      error => console.log('Error getting location:', error),
      Platform.OS === 'android'
        ? {}
        : {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );

    return watchId;
  };

  useEffect(() => {
    const watchId = watchLocation();
   
    return () => {
      // Clear the location watch when the component unmounts
      Geolocation.clearWatch(watchId);
    };
  }, [currentLocation]);

  useEffect(() => {
    setMarkers(route.params.marker);
  
  }, [])

  const showFormModal = () => setModalVisible(true);
  const hideFormModal = () => setModalVisible(false);

  const handleSave = async (storeNumber: string, floorLevel: string) => {
    try {
      if (!currentLocation) {
        // Handle the case where currentLocation is null
        console.error('Error: currentLocation is null');
        return;
      }

      const newMarkerId = Date.now();
      const newMarker: CustomMarker = {
        id: newMarkerId,
        coordinates: currentLocation,
        storeNumber,
        floorLevel,
        longitude: currentLocation?.longitude || 0,
        latitude: currentLocation?.latitude || 0,
      };

      let data = {
        floor_no: floorLevel,
        shop_code: storeNumber,
        altitude: currentLocation?.altitude || null,
        longitude: currentLocation?.longitude || null,
        latitude: currentLocation?.latitude || null,
      };

      const response = await saveLocation(data);
      if (response) {
        setMarkers(prevMarkers => [...prevMarkers, newMarker]);

        Toast.show({
          type: 'success',
          text1: 'Store',
          text2: 'The store is successfully saved',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong while saving, please try again',
      });
    } finally {
      hideFormModal();
    }
  };
  return (
    <View style={{flex: 1}}>
      {currentLocation && markers ? (
        <MapViewComponent markers={markers} />
      ) : (
        <ActivityIndicator size={'large'} color={'#895124'} style={{marginTop:400}} />
      )}

      <FormModal
        isVisible={isModalVisible}
        onClose={hideFormModal}
        onSave={handleSave}
      />

      <TouchableOpacity style={styles.fab} onPress={showFormModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    backgroundColor: '#895124',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#895124',
    padding: 10,
    borderRadius: 6,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    height: Dimensions.get('window').height,
  },
});

export default Home;

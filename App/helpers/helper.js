import axios from "axios";

export const saveLocation = async (data) => {
  try {
    const locationUrl = `https://api.gulfmalldoha.com/api/geo_measure`;
    const response = await axios.post(locationUrl, data);
    console.log("this is the response", response);
    return response

  } catch (error) {

    return error
  }
};

export const getLocation = async () => {
  try {
    const locationUrl = `https://api.gulfmalldoha.com/api/geo_measure`;
    const response = await axios.get(locationUrl);
    if (response.data.status === 'S') {
      const geoMeasures = response.data.geo_measures.map(measure => {
        return {
          floorLevel: measure.floor_no,
          id: measure.id,
          storeNumber: measure.shop_code,
          latitude: parseFloat(measure.latitude), // Convert latitude to a number
          longitude: parseFloat(measure.longitude),
          altitude: parseFloat(measure.altitude)  // Convert longitude to a number
        };
      });
      return geoMeasures
    } else {
      throw new Error(`Failed to retrieve details: ${response.data.message}`);
    }

  } catch (error) {
    return error
  }
} 
import React, { useRef, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, Dimensions } from 'react-native';
import { GOOGLE_MAPS_API_KEY } from '../../secret';

const GoogleMapComponent = (props) => {
  const mapRef = useRef(null);

  // Default coordinate values
  const defaultLatitude = 40.71137;
  const defaultLongitude = -74.2183682;

  // Center coordinate
  const centerCoordinate = {
    latitude: props.latitude || defaultLatitude,
    longitude: props.longitude || defaultLongitude,
  };

  useEffect(() => {
    // Check if the mapRef is available before animating to region
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...centerCoordinate,
        latitudeDelta: 0.008,
        longitudeDelta: 0.0041,
      });
    }
  }, [props.latitude, props.longitude]);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={{
        ...centerCoordinate,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      apiKey={GOOGLE_MAPS_API_KEY}
    >
      <Marker coordinate={centerCoordinate} title="Center Marker" />
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    // marginTop: 20,
    width: "100%",
    height: 200,
    borderRadius: 20
  },
});

export default GoogleMapComponent;


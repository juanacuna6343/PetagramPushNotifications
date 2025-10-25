import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Constants from 'expo-constants';

function MapWeb({ place }) {
  const containerRef = React.useRef(null);
  const apiKey = Constants?.expoConfig?.extra?.googleMapsApiKey;
  const zoom = 16;

  React.useEffect(() => {
    const initMap = () => {
      if (!containerRef.current) return;
      const center = { lat: place.lat, lng: place.lng };
      const map = new window.google.maps.Map(containerRef.current, {
        center,
        zoom,
        mapTypeId: 'roadmap',
      });
      const iconUrl = require('../assets/icon.png');
      const icon = {
        url: iconUrl,
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40),
      };
      new window.google.maps.Marker({ position: center, map, title: place.name, icon });
    };

    // Si no hay API key, usar fallback iframe
    if (!apiKey) {
      if (containerRef.current) {
        const src = `https://maps.google.com/maps?hl=es&q=${place.lat},${place.lng}&z=${zoom}&output=embed`;
        containerRef.current.innerHTML = `<iframe src="${src}" style="border:0;width:100%;height:100%" allowfullscreen loading="lazy"></iframe>`;
      }
      return () => {
        if (containerRef.current) containerRef.current.innerHTML = '';
      };
    }

    // Cargar Google Maps JS si no existe
    if (window.google && window.google.maps) {
      initMap();
      return () => {
        if (containerRef.current) containerRef.current.innerHTML = '';
      };
    }

    let script = document.getElementById('google-maps-js');
    const onLoad = () => initMap();
    if (!script) {
      script = document.createElement('script');
      script.id = 'google-maps-js';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = onLoad;
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', onLoad, { once: true });
      if (window.google && window.google.maps) initMap();
    }
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
      if (script) script.onload = null;
    };
  }, [place.lat, place.lng, place.name, apiKey]);

  return <View ref={containerRef} style={styles.webview} />;
}

export default function MapScreen({ route }) {
  const { place } = route.params;

  const initialRegion = {
    latitude: place.lat,
    longitude: place.lng,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <MapWeb place={place} />
      </View>
    );
  }

  // Carga dinámica para evitar romper el bundle web
  const RNMaps = require('react-native-maps');
  const MapView = RNMaps.default;
  const Marker = RNMaps.Marker;

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion} provider={RNMaps.PROVIDER_GOOGLE}>
        <Marker
          coordinate={{ latitude: place.lat, longitude: place.lng }}
          title={place.name}
          description={'Lugar seleccionado'}
          image={require('../assets/icon.png')}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  webview: { flex: 1 },
});
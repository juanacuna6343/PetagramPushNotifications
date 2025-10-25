import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

const places = [
  { id: '1', name: 'Plaza de Bolívar', lat: 4.8139, lng: -75.6946 },
  { id: '2', name: 'Parque Olaya Herrera', lat: 4.8148, lng: -75.6923 },
  { id: '3', name: 'Centro Comercial Arboleda', lat: 4.8142, lng: -75.6938 },
  { id: '4', name: 'Universidad Tecnológica de Pereira', lat: 4.807, lng: -75.739 },
];

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lugares concurridos de Pereira</Text>
      <View style={styles.list}>
        {places.map((p) => (
          <Pressable
            key={p.id}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            onPress={() => navigation.navigate('Mapa', { place: p })}
          >
            <Text style={styles.itemText}>{p.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    gap: 12,
  },
  item: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  itemPressed: {
    backgroundColor: '#e2e2e2',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
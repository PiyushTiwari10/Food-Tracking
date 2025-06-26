import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, Animated, Easing } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import io from 'socket.io-client';
import { API_CONFIG } from '../config/api';

interface TrackingScreenProps {
  route: { params: { orderId: string } };
}

const DELIVERY_PARTNER = {
  name: 'Ravi Kumar',
  vehicle: 'Bike - DL 8S 1234',
  photo: 'https://randomuser.me/api/portraits/men/75.jpg',
  phone: '+91 98765 43210',
};

const TrackingScreen: React.FC<TrackingScreenProps> = ({ route }) => {
  const { orderId } = route.params;
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<string>('');
  const [eta, setEta] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationHistory, setLocationHistory] = useState<{ lat: number; lng: number }[]>([]);
  const socketRef = useRef<any>(null);
  const markerAnim = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    // Connect to Socket.IO server
    const socket = io(API_CONFIG.BASE_URL.replace('/api', ''), {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      // Request to track this order
      socket.emit('track_order', orderId);
    });

    socket.on('location_update', (data) => {
      if (data.orderId === orderId) {
        setStatus(data.status);
        setEta(data.eta);
        setLoading(false);
        setLocation((prev) => {
          if (!prev) {
            markerAnim.setValue({ x: data.location.lat, y: data.location.lng });
            setLocationHistory([data.location]);
            return data.location;
          } else {
            Animated.timing(markerAnim, {
              toValue: { x: data.location.lat, y: data.location.lng },
              duration: 1000,
              useNativeDriver: false,
              easing: Easing.linear,
            }).start();
            setLocationHistory((hist) => [...hist, data.location]);
            return data.location;
          }
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  const animatedMarker = {
    latitude: markerAnim.x,
    longitude: markerAnim.y,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Track Your Delivery</Text>
      {loading || !location ? (
        <ActivityIndicator size="large" color="#00bcd4" style={{ marginTop: 40 }} />
      ) : (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: location.lat,
            longitude: location.lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          region={{
            latitude: location.lat,
            longitude: location.lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          {locationHistory.length > 1 && (
            <Polyline
              coordinates={locationHistory.map((loc) => ({ latitude: loc.lat, longitude: loc.lng }))}
              strokeColor="#007AFF"
              strokeWidth={4}
            />
          )}
          <Marker.Animated
            coordinate={animatedMarker}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <Image
              source={require('../assets/delivery_bike.png')}
              style={{ width: 48, height: 48 }}
              resizeMode="contain"
            />
          </Marker.Animated>
        </MapView>
      )}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>Status: {status}</Text>
        {eta !== null && <Text style={styles.statusText}>ETA: {eta} min</Text>}
      </View>
      <View style={styles.partnerCard}>
        <Image source={{ uri: DELIVERY_PARTNER.photo }} style={styles.partnerPhoto} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.partnerName}>{DELIVERY_PARTNER.name}</Text>
          <Text style={styles.partnerVehicle}>{DELIVERY_PARTNER.vehicle}</Text>
          <Text style={styles.partnerPhone}>{DELIVERY_PARTNER.phone}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  map: {
    flex: 1,
    margin: 10,
    borderRadius: 12,
  },
  statusBar: {
    padding: 16,
    backgroundColor: '#e0f7fa',
    borderTopWidth: 1,
    borderColor: '#00bcd4',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00796b',
    marginRight: 16,
  },
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  partnerPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#00bcd4',
  },
  partnerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  partnerVehicle: {
    fontSize: 15,
    color: '#888',
    marginBottom: 2,
  },
  partnerPhone: {
    fontSize: 15,
    color: '#007AFF',
  },
});

export default TrackingScreen; 
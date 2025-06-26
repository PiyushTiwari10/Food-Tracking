import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

const OrderHistoryScreen = ({ navigation }: any) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('userToken');
        const res = await axios.get(`${API_CONFIG.BASE_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data.orders);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleTrackOrder = (orderId: string) => {
    navigation.navigate('Tracking', { orderId });
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.orderItem}>
      <Image source={{ uri: item.productImage }} style={styles.orderImage} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.orderName}>{item.productName}</Text>
        <Text style={styles.orderStatus}>Status: {item.status}</Text>
        <Text style={styles.orderPrice}>₹{item.productPrice}</Text>
        <TouchableOpacity style={styles.trackButton} onPress={() => handleTrackOrder(item._id)}>
          <Text style={styles.trackButtonText}>Track Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order History</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#00bcd4" style={{ marginTop: 40 }} />
      ) : orders.length === 0 ? (
        <Text style={styles.empty}>No orders found.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  empty: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 1,
  },
  orderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  orderName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderStatus: {
    fontSize: 15,
    color: '#00796b',
    marginBottom: 4,
  },
  orderPrice: {
    fontSize: 15,
    color: '#888',
    marginBottom: 8,
  },
  trackButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  trackButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default OrderHistoryScreen; 
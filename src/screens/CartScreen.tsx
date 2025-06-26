import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { useCartStore } from '../store/useCartStore';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { API_CONFIG } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartScreen = ({ navigation }: any) => {
  const { items, removeFromCart, clearCart, incrementQuantity, decrementQuantity } = useCartStore();
  const { user } = useAuth();

  const total = items.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      Alert.alert('Cart is empty', 'Add items to your cart before placing an order.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('userToken');
      for (const item of items) {
        await axios.post(
          `${API_CONFIG.BASE_URL}/orders`,
          {
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            productPrice: item.productPrice,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      clearCart();
      Alert.alert('Order Placed', 'Your order has been placed successfully!');
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Order Failed', 'There was an error placing your order.');
    }
  };

  const handleTrackOrder = (orderId: string) => {
    navigation.navigate('Tracking', { orderId });
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.productImage }} style={styles.cartImage} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.cartName}>{item.productName}</Text>
        <Text style={styles.cartPrice}>₹{item.productPrice}</Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity style={styles.qtyButton} onPress={() => decrementQuantity(item.productId)}>
            <Icon name="remove-circle-outline" size={24} color="#00bcd4" />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity style={styles.qtyButton} onPress={() => incrementQuantity(item.productId)}>
            <Icon name="add-circle-outline" size={24} color="#00bcd4" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleRemove(item.productId)}>
        <Icon name="trash-outline" size={24} color="#ff5252" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>Your cart is empty.</Text>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={item => item.productId}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalAmount}>₹{total}</Text>
          </View>
          <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
            <Text style={styles.orderButtonText}>Place Order</Text>
          </TouchableOpacity>
        </>
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
  cartItem: {
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
  cartImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  cartName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cartPrice: {
    fontSize: 15,
    color: '#888',
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  qtyButton: {
    padding: 4,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
    minWidth: 24,
    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00bcd4',
  },
  orderButton: {
    backgroundColor: '#00bcd4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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

export default CartScreen; 
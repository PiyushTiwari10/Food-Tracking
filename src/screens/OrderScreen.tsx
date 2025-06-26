import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image, Dimensions } from 'react-native';
import { products } from '../data/products';
import { useAuth } from '../context/AuthContext';
import { useCartStore } from '../store/useCartStore';
import Icon from 'react-native-vector-icons/Ionicons';

const CARD_MARGIN = 10;
const CARD_WIDTH = (Dimensions.get('window').width - CARD_MARGIN * 3) / 2;

const HomeScreen = ({ navigation }: any) => {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const { items: cartItems, addToCart } = useCartStore();

  const handleAddToCart = (item: any) => {
    addToCart({
      productId: item.id,
      productName: item.name,
      productImage: item.image,
      productPrice: item.price,
    });
    Alert.alert('Added to Cart', `${item.name} has been added to your cart.`);
  };

  const renderItem = ({ item }: any) => (
    <View style={[
      styles.productCard,
      selectedProduct === item.id && styles.selectedProduct,
    ]}>
      <TouchableOpacity onPress={() => setSelectedProduct(item.id)} activeOpacity={0.8}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>₹{item.price}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.addToCartButton} onPress={() => handleAddToCart(item)}>
        <Text style={styles.addToCartButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome{user?.name ? `, ${user.name}` : ''}!</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.historyButton} onPress={() => navigation.navigate('OrderHistory')}>
            <Icon name="time-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
            <Icon name="cart-outline" size={28} color="#00bcd4" />
            {cartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.title}>Select a Product to Order</Text>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={2}
        key={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  historyButton: {
    marginRight: 8,
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cartButton: {
    marginRight: 16,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#ff5252',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  logoutButton: {
    backgroundColor: '#ff5252',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: CARD_MARGIN,
  },
  productCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginBottom: 0,
    width: CARD_WIDTH,
    marginRight: CARD_MARGIN,
    marginLeft: 0,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  selectedProduct: {
    borderColor: '#00bcd4',
    backgroundColor: '#e0f7fa',
  },
  productImage: {
    width: CARD_WIDTH - 24,
    height: CARD_WIDTH - 24,
    borderRadius: 12,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 15,
    color: '#888',
    marginBottom: 4,
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#00bcd4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  addToCartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default HomeScreen; 
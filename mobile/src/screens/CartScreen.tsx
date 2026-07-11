import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {
  removeFromCart,
  updateQuantity,
  selectCartItems,
  selectCartTotal,
} from '../store/slices/cartSlice';
import {CartItem} from '../types';

interface Props {
  navigation: any;
}

const CartScreen: React.FC<Props> = ({navigation}) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);

  const formatPrice = (priceInCents: number): string => {
    return `$${(priceInCents / 100).toLocaleString('es-CO')}`;
  };

  const renderCartItem = ({item}: {item: CartItem}) => (
    <View style={styles.cartItem}>
      <Image source={{uri: item.product.image}} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.product.name}</Text>
        <Text style={styles.itemPrice}>{formatPrice(item.product.price)}</Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() =>
              dispatch(
                updateQuantity({
                  productId: item.product.id,
                  quantity: item.quantity - 1,
                }),
              )
            }>
            <Text style={styles.qtyButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() =>
              dispatch(
                updateQuantity({
                  productId: item.product.id,
                  quantity: item.quantity + 1,
                }),
              )
            }>
            <Text style={styles.qtyButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => dispatch(removeFromCart(item.product.id))}>
            <Text style={styles.removeText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyText}>Tu carrito está vacío</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.shopButtonText}>Ir a comprar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Carrito</Text>
        <View style={styles.headerSpacer} />
      </View>
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={item => item.product.id}
        contentContainerStyle={styles.list}
      />
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>{formatPrice(cartTotal)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('Checkout')}>
          <Text style={styles.checkoutText}>Pagar con tarjeta de crédito</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8F0',
  },
  backButton: {
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  headerSpacer: {
    width: 60,
  },
  list: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6C63FF',
    marginTop: 4,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  qtyButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    color: '#1A1A2E',
  },
  removeButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  removeText: {
    fontSize: 18,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8E8F0',
    paddingBottom: 36,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    color: '#666',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  checkoutButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5FA',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default CartScreen;

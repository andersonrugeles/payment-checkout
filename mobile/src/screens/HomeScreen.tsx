import React, {useEffect, useState, useMemo} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '../store/store';
import {loadProducts} from '../store/slices/productsSlice';
import {addToCart, selectCartCount} from '../store/slices/cartSlice';
import {Product} from '../types';

interface Props {
  navigation: any;
}

const ALL_CATEGORY = 'Todos';
const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_ITEM_WIDTH = (SCREEN_WIDTH - 48) / 2;

type ViewMode = 'list' | 'grid';

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {items: products, loading, error} = useSelector(
    (state: RootState) => state.products,
  );
  const cartCount = useSelector(selectCartCount);
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  useEffect(() => {
    dispatch(loadProducts());
  }, [dispatch]);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return [ALL_CATEGORY, ...cats.sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === ALL_CATEGORY) {
      return products;
    }
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart(product));
  };

  const formatPrice = (priceInCents: number): string => {
    return `$${(priceInCents / 100).toLocaleString('es-CO')}`;
  };

  const renderProductList = ({item}: {item: Product}) => (
    <View style={styles.productCard}>
      <Image source={{uri: item.image}} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          <TouchableOpacity
            style={[
              styles.addButton,
              item.stock === 0 && styles.addButtonDisabled,
            ]}
            onPress={() => handleAddToCart(item)}
            disabled={item.stock === 0}>
            <Text style={styles.addButtonText}>
              {item.stock === 0 ? 'Sin stock' : '+ Agregar'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.stockText}>Stock: {item.stock}</Text>
      </View>
    </View>
  );

  const renderProductGrid = ({item}: {item: Product}) => (
    <View style={styles.gridCard}>
      <Image source={{uri: item.image}} style={styles.gridImage} />
      <View style={styles.gridInfo}>
        <Text style={styles.gridCategory}>{item.category}</Text>
        <Text style={styles.gridName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.gridPrice}>{formatPrice(item.price)}</Text>
        <TouchableOpacity
          style={[
            styles.gridAddButton,
            item.stock === 0 && styles.addButtonDisabled,
          ]}
          onPress={() => handleAddToCart(item)}
          disabled={item.stock === 0}>
          <Text style={styles.gridAddButtonText}>
            {item.stock === 0 ? 'Sin stock' : '+ Agregar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(loadProducts())}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tienda</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() =>
              setViewMode(viewMode === 'list' ? 'grid' : 'list')
            }>
            <Text style={styles.viewToggleText}>
              {viewMode === 'list' ? '▦' : '☰'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.cartIcon}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterChip,
                selectedCategory === category && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}>
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === category && styles.filterChipTextActive,
                ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {viewMode === 'list' ? (
        <FlatList
          key="list"
          data={filteredProducts}
          renderItem={renderProductList}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          key="grid"
          data={filteredProducts}
          renderItem={renderProductGrid}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewToggle: {
    padding: 8,
    backgroundColor: '#F0F0F5',
    borderRadius: 8,
  },
  viewToggleText: {
    fontSize: 20,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartIcon: {
    fontSize: 28,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF4757',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8F0',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F5',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#6C63FF',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 16,
  },
  // List view styles
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 16,
  },
  productCategory: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  addButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#CCC',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  stockText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  // Grid view styles
  gridRow: {
    justifyContent: 'space-between',
  },
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    width: GRID_ITEM_WIDTH,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gridImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  gridInfo: {
    padding: 10,
  },
  gridCategory: {
    fontSize: 10,
    color: '#6C63FF',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  gridName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  gridPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  gridAddButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  gridAddButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  // Common
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5FA',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    color: '#FF4757',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default HomeScreen;

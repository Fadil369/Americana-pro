import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

interface Product {
  sku: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  category: string;
  category_en: string;
  brand: string;
  price: number;
  image_url?: string;
  requires_refrigeration: boolean;
  stock_quantity: number;
}

const ProductCatalogScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const mockProducts: Product[] = [
    {
      sku: 'AMR-KUN-001',
      name_ar: 'كنافة بالجبن الطازجة',
      name_en: 'Fresh Cheese Kunafa',
      description_ar: 'كنافة طازجة محشوة بالجبن الطبيعي',
      description_en: 'Fresh kunafa filled with natural cheese',
      category: 'حلويات مبردة',
      category_en: 'Refrigerated Sweets',
      brand: 'Americana',
      price: 25.50,
      requires_refrigeration: true,
      stock_quantity: 50
    },
    {
      sku: 'AMR-MUH-001',
      name_ar: 'مهلبية بالفستق',
      name_en: 'Pistachio Muhallabia',
      description_ar: 'مهلبية كريمية مزينة بالفستق الحلبي',
      description_en: 'Creamy muhallabia topped with Aleppo pistachios',
      category: 'حلويات مبردة',
      category_en: 'Refrigerated Sweets',
      brand: 'Americana',
      price: 18.75,
      requires_refrigeration: true,
      stock_quantity: 75
    },
    {
      sku: 'SAU-BAK-001',
      name_ar: 'بقلاوة بالفستق',
      name_en: 'Pistachio Baklava',
      description_ar: 'بقلاوة مقرمشة محشوة بالفستق الحلبي',
      description_en: 'Crispy baklava filled with Aleppo pistachios',
      category: 'حلويات تقليدية',
      category_en: 'Traditional Sweets',
      brand: 'SSDP',
      price: 32.00,
      requires_refrigeration: false,
      stock_quantity: 100
    }
  ];

  useEffect(() => {
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const filterProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        isRTL ? product.category === selectedCategory : product.category_en === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => {
        const name = isRTL ? product.name_ar : product.name_en;
        const description = isRTL ? product.description_ar : product.description_en;
        return name.toLowerCase().includes(query) || description.toLowerCase().includes(query);
      });
    }

    setFilteredProducts(filtered);
  };

  const categories = [
    { key: 'all', name_ar: 'الكل', name_en: 'All' },
    { key: 'حلويات مبردة', name_ar: 'حلويات مبردة', name_en: 'Refrigerated Sweets' },
    { key: 'حلويات تقليدية', name_ar: 'حلويات تقليدية', name_en: 'Traditional Sweets' }
  ];

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={[styles.productCard, isRTL && styles.rtl]}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <View style={styles.productImage}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
          </View>
        )}
        {item.requires_refrigeration && (
          <View style={styles.refrigerationBadge}>
            <Ionicons name="snow-outline" size={16} color="#fff" />
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>
          {isRTL ? item.name_ar : item.name_en}
        </Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {isRTL ? item.description_ar : item.description_en}
        </Text>
        <View style={styles.productFooter}>
          <Text style={styles.price}>{item.price.toFixed(2)} ريال</Text>
          <Text style={styles.stock}>
            المخزون: {item.stock_quantity}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isRTL && styles.rtl]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, isRTL && styles.rtlText]}
          placeholder={isRTL ? "البحث عن المنتجات..." : "Search products..."}
          value={searchQuery}
          onChangeText={setSearchQuery}
          textAlign={isRTL ? 'right' : 'left'}
        />
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.key}
        style={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item.key && styles.selectedCategory
            ]}
            onPress={() => setSelectedCategory(item.key)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === item.key && styles.selectedCategoryText
            ]}>
              {isRTL ? item.name_ar : item.name_en}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.sku}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  rtl: {
    direction: 'rtl',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  rtlText: {
    textAlign: 'right',
  },
  categoryList: {
    marginBottom: 16,
  },
  categoryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCategory: {
    backgroundColor: '#ea580c',
    borderColor: '#ea580c',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  productsList: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    position: 'relative',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  placeholderImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refrigerationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    padding: 4,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ea580c',
  },
  stock: {
    fontSize: 12,
    color: '#10b981',
  },
});

export default ProductCatalogScreen;

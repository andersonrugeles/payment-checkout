import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {AppDispatch} from '../store/store';
import {selectCartItems, selectCartTotal, clearCart} from '../store/slices/cartSlice';
import {processPayment} from '../store/slices/transactionSlice';
import {
  isValidLuhn,
  detectCardBrand,
  formatCardNumber,
  isValidExpDate,
  isValidCVC,
  isValidCardHolder,
} from '../utils/cardValidation';
import {CardBrand} from '../types';

interface Props {
  navigation: any;
}

const CheckoutScreen: React.FC<Props> = ({navigation}) => {
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);

  const [showCardForm, setShowCardForm] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [email, setEmail] = useState('');
  const [cardBrand, setCardBrand] = useState<CardBrand>('unknown');

  const formatPrice = (priceInCents: number): string => {
    return `$${(priceInCents / 100).toLocaleString('es-CO')}`;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
    const brand = detectCardBrand(text);
    setCardBrand(brand);
  };

  const isCardValid = (): boolean => {
    const rawNumber = cardNumber.replace(/\s/g, '');
    return (
      isValidLuhn(rawNumber) &&
      isValidExpDate(expMonth, expYear) &&
      isValidCVC(cvc) &&
      isValidCardHolder(cardHolder) &&
      email.includes('@')
    );
  };

  const handleContinueToSummary = () => {
    if (!isCardValid()) {
      Alert.alert('Error', 'Por favor verifica los datos de tu tarjeta');
      return;
    }
    setShowCardForm(false);
    setShowSummary(true);
  };

  const handlePay = async () => {
    const rawNumber = cardNumber.replace(/\s/g, '');
    setIsProcessing(true);
    try {
      await dispatch(
        processPayment({
          customerEmail: email,
          items: cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          cardData: {
            number: rawNumber,
            cvc,
            exp_month: expMonth,
            exp_year: expYear,
            card_holder: cardHolder,
          },
          installments: 1,
        }),
      ).unwrap();

      setIsProcessing(false);
      setShowSummary(false);
      dispatch(clearCart());
      navigation.navigate('TransactionResult');
    } catch (err: any) {
      setIsProcessing(false);
      setShowSummary(false);
      Alert.alert(
        'Error de pago',
        typeof err === 'string' ? err : 'No se pudo procesar el pago',
      );
    }
  };

  const getBrandIcon = (): string => {
    switch (cardBrand) {
      case 'visa':
        return '💳 VISA';
      case 'mastercard':
        return '💳 MC';
      default:
        return '💳';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pago</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Resumen del pedido</Text>
        {cartItems.map(item => (
          <View key={item.product.id} style={styles.orderItem}>
            <Text style={styles.orderItemName}>
              {item.product.name} x{item.quantity}
            </Text>
            <Text style={styles.orderItemPrice}>
              {formatPrice(item.product.price * item.quantity)}
            </Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.orderItem}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>{formatPrice(cartTotal)}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => setShowCardForm(true)}>
          <Text style={styles.payButtonText}>💳 Pagar con tarjeta de crédito</Text>
        </TouchableOpacity>
      </View>

      {/* Card Form Backdrop */}
      <Modal
        visible={showCardForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCardForm(false)}>
        <View style={styles.backdrop}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Datos de la tarjeta</Text>

            <View style={styles.cardBrandRow}>
              <Text style={styles.brandText}>{getBrandIcon()}</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Número de tarjeta"
              placeholderTextColor="#999"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              keyboardType="numeric"
              maxLength={19}
            />
            <TextInput
              style={styles.input}
              placeholder="Nombre del titular"
              placeholderTextColor="#999"
              value={cardHolder}
              onChangeText={setCardHolder}
              autoCapitalize="characters"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="MM"
                placeholderTextColor="#999"
                value={expMonth}
                onChangeText={setExpMonth}
                keyboardType="numeric"
                maxLength={2}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="YY"
                placeholderTextColor="#999"
                value={expYear}
                onChangeText={setExpYear}
                keyboardType="numeric"
                maxLength={2}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="CVC"
                placeholderTextColor="#999"
                value={cvc}
                onChangeText={setCvc}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[
                styles.continueButton,
                !isCardValid() && styles.continueButtonDisabled,
              ]}
              onPress={handleContinueToSummary}
              disabled={!isCardValid()}>
              <Text style={styles.continueText}>Continuar al resumen</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCardForm(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Summary Backdrop */}
      <Modal
        visible={showSummary}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSummary(false)}>
        <View style={styles.backdrop}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Confirmar pago</Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Tarjeta</Text>
              <Text style={styles.summaryValue}>
                {getBrandIcon()} •••• {cardNumber.slice(-4)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Titular</Text>
              <Text style={styles.summaryValue}>{cardHolder}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total a pagar</Text>
              <Text style={styles.summaryTotal}>{formatPrice(cartTotal)}</Text>
            </View>

            {isProcessing ? (
              <ActivityIndicator
                size="large"
                color="#6C63FF"
                style={styles.processingSpinner}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handlePay}>
                  <Text style={styles.confirmText}>Confirmar pago</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowSummary(false)}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F5FA'},
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
  backButton: {fontSize: 16, color: '#6C63FF', fontWeight: '600'},
  headerTitle: {fontSize: 20, fontWeight: '700', color: '#1A1A2E'},
  headerSpacer: {width: 60},
  content: {flex: 1, padding: 20},
  sectionTitle: {fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginBottom: 16},
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  orderItemName: {fontSize: 15, color: '#333', flex: 1},
  orderItemPrice: {fontSize: 15, fontWeight: '600', color: '#1A1A2E'},
  divider: {height: 1, backgroundColor: '#E8E8F0', marginVertical: 12},
  totalLabel: {fontSize: 18, fontWeight: '700', color: '#1A1A2E'},
  totalPrice: {fontSize: 22, fontWeight: '700', color: '#6C63FF'},
  footer: {padding: 20, paddingBottom: 36, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E8E8F0'},
  payButton: {backgroundColor: '#6C63FF', paddingVertical: 16, borderRadius: 12, alignItems: 'center'},
  payButtonText: {color: '#FFFFFF', fontSize: 16, fontWeight: '700'},
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'},
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {fontSize: 20, fontWeight: '700', color: '#1A1A2E', marginBottom: 20, textAlign: 'center'},
  cardBrandRow: {alignItems: 'center', marginBottom: 12},
  brandText: {fontSize: 18, fontWeight: '600', color: '#6C63FF'},
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E8',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#1A1A2E',
    marginBottom: 12,
    backgroundColor: '#F9F9FC',
  },
  row: {flexDirection: 'row', gap: 8},
  halfInput: {flex: 1},
  continueButton: {backgroundColor: '#6C63FF', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8},
  continueButtonDisabled: {backgroundColor: '#B8B5E8'},
  continueText: {color: '#FFFFFF', fontSize: 16, fontWeight: '700'},
  cancelButton: {paddingVertical: 12, alignItems: 'center', marginTop: 8},
  cancelText: {color: '#999', fontSize: 15},
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  summaryLabel: {fontSize: 14, color: '#666'},
  summaryValue: {fontSize: 15, fontWeight: '600', color: '#1A1A2E'},
  summaryTotal: {fontSize: 20, fontWeight: '700', color: '#6C63FF'},
  confirmButton: {backgroundColor: '#28C76F', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 20},
  confirmText: {color: '#FFFFFF', fontSize: 16, fontWeight: '700'},
  processingSpinner: {marginVertical: 20},
});

export default CheckoutScreen;

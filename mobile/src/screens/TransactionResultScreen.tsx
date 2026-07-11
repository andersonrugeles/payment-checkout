import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '../store/store';
import {resetTransaction, refreshStatus} from '../store/slices/transactionSlice';
import {TransactionStatus} from '../types';

interface Props {
  navigation: any;
}

const TransactionResultScreen: React.FC<Props> = ({navigation}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {current: transaction} = useSelector(
    (state: RootState) => state.transaction,
  );
  const [refreshing, setRefreshing] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-poll when status is PENDING
  useEffect(() => {
    if (transaction?.status === TransactionStatus.PENDING && transaction?.id) {
      pollingRef.current = setInterval(async () => {
        try {
          await dispatch(refreshStatus(transaction.id)).unwrap();
        } catch {
          // silently fail, will retry
        }
      }, 2500);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [transaction?.status, transaction?.id, dispatch]);

  // Stop polling when status changes from PENDING
  useEffect(() => {
    if (
      transaction?.status &&
      transaction.status !== TransactionStatus.PENDING &&
      pollingRef.current
    ) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, [transaction?.status]);

  const getStatusConfig = () => {
    if (!transaction) {
      return {
        icon: '⏳',
        title: 'Procesando...',
        subtitle: 'Esperando resultado de la transacción',
        color: '#FFA502',
      };
    }

    switch (transaction.status) {
      case TransactionStatus.APPROVED:
        return {
          icon: '✅',
          title: '¡Pago exitoso!',
          subtitle: 'Tu transacción fue aprobada',
          color: '#28C76F',
        };
      case TransactionStatus.DECLINED:
        return {
          icon: '❌',
          title: 'Pago rechazado',
          subtitle: 'La transacción fue declinada por el emisor',
          color: '#FF4757',
        };
      case TransactionStatus.PENDING:
        return {
          icon: '⏳',
          title: 'Pago pendiente',
          subtitle: 'Tu transacción está siendo procesada. Consulta el estado en unos momentos.',
          color: '#FFA502',
        };
      case TransactionStatus.ERROR:
        return {
          icon: '⚠️',
          title: 'Error en el pago',
          subtitle: 'Ocurrió un error procesando la transacción',
          color: '#FF6348',
        };
      default:
        return {
          icon: '⏳',
          title: 'Procesando...',
          subtitle: 'Esperando resultado de la transacción',
          color: '#FFA502',
        };
    }
  };

  const config = getStatusConfig();

  const formatPrice = (priceInCents: number): string => {
    return `$${(priceInCents / 100).toLocaleString('es-CO')}`;
  };

  const handleRefreshStatus = async () => {
    if (!transaction?.id) return;
    setRefreshing(true);
    try {
      await dispatch(refreshStatus(transaction.id)).unwrap();
    } catch {
      // silently fail
    }
    setRefreshing(false);
  };

  const handleGoHome = () => {
    dispatch(resetTransaction());
    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={[styles.title, {color: config.color}]}>{config.title}</Text>
        <Text style={styles.subtitle}>{config.subtitle}</Text>

        {transaction && (
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Referencia</Text>
              <Text style={styles.detailValue}>{transaction.reference}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Monto</Text>
              <Text style={styles.detailValue}>
                {formatPrice(transaction.amountInCents)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Estado</Text>
              <Text style={[styles.statusBadge, {color: config.color}]}>
                {transaction.status}
              </Text>
            </View>
            {transaction.items.map((item, index) => (
              <View key={index} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{item.productName}</Text>
                <Text style={styles.detailValue}>x{item.quantity}</Text>
              </View>
            ))}
          </View>
        )}

        {transaction?.status === TransactionStatus.PENDING && (
          <View style={styles.pendingSection}>
            <ActivityIndicator size="small" color="#FFA502" style={styles.pendingSpinner} />
            <Text style={styles.pendingText}>Consultando estado del pago...</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefreshStatus}
              disabled={refreshing}>
              {refreshing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.refreshButtonText}>🔄 Consultar ahora</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
        <Text style={styles.homeButtonText}>Volver a la tienda</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5FA',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  details: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F5',
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  statusBadge: {
    fontSize: 14,
    fontWeight: '700',
  },
  refreshButton: {
    backgroundColor: '#FFA502',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    width: '100%',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  pendingSection: {
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  pendingText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
  },
  pendingSpinner: {
    marginBottom: 8,
  },
  homeButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default TransactionResultScreen;

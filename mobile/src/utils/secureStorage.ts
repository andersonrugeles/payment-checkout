import EncryptedStorage from 'react-native-encrypted-storage';

const TRANSACTION_KEY = 'secure_transaction_data';

export async function saveTransactionSecurely(data: any): Promise<void> {
  try {
    await EncryptedStorage.setItem(TRANSACTION_KEY, JSON.stringify(data));
  } catch {
    // Silently fail - non-critical
  }
}

export async function getSecureTransaction(): Promise<any | null> {
  try {
    const raw = await EncryptedStorage.getItem(TRANSACTION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearSecureTransaction(): Promise<void> {
  try {
    await EncryptedStorage.removeItem(TRANSACTION_KEY);
  } catch {
    // Silently fail
  }
}

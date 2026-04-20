import { Alert, Platform } from 'react-native';

/**
 * Единообразная заглушка для ещё не реализованных разделов.
 * На вебе показывает нативный alert, на native — Alert.alert.
 * Когда появится реальный экран/API — заменяем вызов на навигацию.
 */
export function showSoonNotice(
  title = 'Скоро',
  message = 'Раздел появится в одной из следующих итераций.',
) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

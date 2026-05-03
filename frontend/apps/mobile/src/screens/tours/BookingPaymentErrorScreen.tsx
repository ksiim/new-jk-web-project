import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import type { MainStackParamList } from '../../navigation/MainNavigator';
import { colors } from '../../shared/theme/colors';
import { ScreenHeader } from '../../shared/ui/ScreenHeader';
import { SaveButton } from '../../shared/ui/SaveButton';

type Props = NativeStackScreenProps<MainStackParamList, 'BookingPaymentError'>;

const PLACEHOLDER = 'Информация об ошибке (если есть)';

export function BookingPaymentErrorScreen({ route, navigation }: Props) {
  const { bookingId, errorMessage } = route.params;

  return (
    <View style={styles.root}>
      <View style={styles.inner}>
        <ScreenHeader />
        <Text style={styles.title}>Во время оплаты произошла ошибка</Text>
        <Text style={styles.subtitle}>{errorMessage?.trim() || PLACEHOLDER}</Text>
      </View>
      <View style={[styles.footer, styles.footerStretch]}>
        <SaveButton
          style={styles.payBtnWide}
          title="Попробовать снова"
          onPress={() => navigation.replace('TourPayment', { bookingId })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, paddingHorizontal: 20, paddingBottom: 16 },
  title: {
    marginTop: 12,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 16,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 8,
  },
  footerStretch: {
    alignItems: 'stretch',
  },
  payBtnWide: {
    alignSelf: 'stretch',
  },
});

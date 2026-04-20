import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type Props = {
  visible: boolean;
  title: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  confirmLabel = 'Да',
  cancelLabel = 'Нет',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Pressable style={styles.close} hitSlop={8} onPress={onCancel}>
            <Feather name="x" size={20} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.actions}>
            <Pressable
              style={[styles.btn, styles.btnConfirm]}
              onPress={onConfirm}
            >
              <Text style={[styles.btnText, styles.btnTextConfirm]}>
                {confirmLabel}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnCancel]}
              onPress={onCancel}
            >
              <Text style={[styles.btnText, styles.btnTextCancel]}>
                {cancelLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlayDarkStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 20,
    paddingTop: 32,
  },
  close: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  actions: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
  },
  btn: {
    flex: 1,
    maxWidth: 120,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnConfirm: {
    backgroundColor: colors.accentButton,
  },
  btnCancel: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  btnTextConfirm: {
    color: colors.white,
  },
  btnTextCancel: {
    color: colors.textPrimary,
  },
});

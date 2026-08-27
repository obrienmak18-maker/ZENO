import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const colors = { background: '#f7f4ff' };

type Props = PropsWithChildren<{ scroll?: boolean; contentContainerStyle?: ScrollViewProps['contentContainerStyle'] } & Pick<ViewProps, 'style'>>;

export function ScreenContainer({ children, scroll = true, contentContainerStyle, style }: Props) {
  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[styles.safe, style]}>
      {scroll ? <ScrollView contentContainerStyle={[styles.content, contentContainerStyle]} keyboardShouldPersistTaps="handled">{children}</ScrollView> : <View style={styles.content}>{children}</View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: 20, gap: 16 },
});

import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {useTheme} from '@/providers';

export function LoadingOverlay() {
  const {theme} = useTheme();

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <View style={[styles.overlay, {backgroundColor: theme.background}]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export function LoadingOverlay() {
  const {theme} = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        ...StyleSheet.absoluteFillObject,
        pointerEvents: 'box-none',
      },
      overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.background,
      },
    }),
  (theme) => theme.version.toString(),
);

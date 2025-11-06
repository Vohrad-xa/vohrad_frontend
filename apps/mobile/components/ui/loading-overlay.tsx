import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers/theme-provider';
import {makeStyleFactory} from '@/utils/style-factory';

interface LoadingOverlayProps {
  fullScreen?: boolean;
}

export function LoadingOverlay({fullScreen = false}: LoadingOverlayProps) {
  const {theme} = useTheme();
  const styles = createStyles(theme, fullScreen);

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (theme: ThemeShape, fullScreen: boolean) =>
    StyleSheet.create({
      container: {
        ...StyleSheet.absoluteFillObject,
        pointerEvents: 'box-none',
      },
      overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: fullScreen ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
      },
    }),
  (theme, fullScreen) => `${theme.version}|${fullScreen}`,
);

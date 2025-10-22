import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import {BlurView} from 'expo-blur';
import Animated from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SearchBar, GlassCard} from '@/components/ui';
import type {ColorScheme} from '@/constants/colors';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon, AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

interface SideMenuHeaderProps {
  headerStyle: object;
  onClose: () => void;
}

export function SideMenuHeader({headerStyle, onClose}: SideMenuHeaderProps) {
  const {theme, ds, scheme} = useTheme();
  const insets = useSafeAreaInsets();

  const topPadding =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? 0) + ds.spacing.lg
      : Math.max(insets.top, ds.spacing.xl);

  const styles = createStyles(theme, ds, scheme, topPadding);

  return (
    <Animated.View style={headerStyle}>
      <BlurView
        intensity={40}
        tint={scheme === 'dark' ? 'dark' : 'light'}
        style={styles.headerBlurView}
      >
        <View style={styles.headerContent}>
          <SearchBar style={styles.searchBar} placeholder="Search" />
          <GlassCard isInteractive>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Close sidebar"
            >
              <Icon name={AppIcons.navigation.close} />
            </TouchableOpacity>
          </GlassCard>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const createStyles = makeStyleFactory(
  (theme: ThemeShape, ds: DSShape, scheme: ColorScheme, topPadding: number) =>
    StyleSheet.create({
      headerBlurView: {
        paddingLeft: ds.spacing.lg,
        paddingRight: ds.spacing.lg,
        paddingVertical: ds.spacing.md,
        paddingTop: topPadding,
      },
      headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: ds.spacing.sm,
      },
      searchBar: {
        flex: 1,
      },
      closeButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),
  (theme, ds, scheme, topPadding) =>
    `${themeKey(theme, ds)}|${scheme}|${topPadding}`,
);

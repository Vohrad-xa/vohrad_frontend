import {View, TouchableOpacity, StyleSheet, Platform, StatusBar} from 'react-native';
import {BlurView} from 'expo-blur';
import Animated from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SearchBar} from '@/components/ui';
import type {Tokens, ColorScheme} from '@/constants/colors';
import {Palette} from '@/constants/colors';
import type {DesignSystem} from '@/constants/typography';
import {usePlatformStyles} from '@/hooks';
import {useTheme} from '@/providers';
import {Icon, AppIcons} from '@/utils';

interface SideMenuHeaderProps {
  headerStyle: object;
  onClose: () => void;
}

export function SideMenuHeader({headerStyle, onClose}: SideMenuHeaderProps) {
  const {theme, ds, scheme} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, ds, scheme);

  const topPadding =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? 0) + ds.spacing.xl
      : Math.max(insets.top, ds.spacing.xl) + ds.spacing.md;

  const headerContentStyle = usePlatformStyles({
    web: styles.headerContentWeb,
    mobile: styles.headerContentMobile,
  });

  const searchBarStyle = usePlatformStyles({
    web: styles.searchBar,
    mobile: styles.searchBarMobile,
  });

  return (
    <Animated.View style={headerStyle}>
      <BlurView
        intensity={40}
        tint={scheme === 'dark' ? 'dark' : 'light'}
        style={[styles.headerBlurView, {paddingTop: topPadding}]}>
        <View style={headerContentStyle}>
          <SearchBar style={searchBarStyle} placeholder="Search" />
          {Platform.OS === 'web' && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon
                name={AppIcons.navigation.close}
                size={ds.iconSize.lg}
                color={scheme === 'dark' ? '#f8f7f7ff' : theme.text}
              />
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
    </Animated.View>
  );
}

const createStyles = (theme: typeof Tokens.light | typeof Tokens.dark, ds: typeof DesignSystem, scheme: ColorScheme) =>
  StyleSheet.create({
    headerBlurView: {
      paddingHorizontal: ds.spacing.xl,
      paddingVertical: ds.spacing.md,
    },
    headerContentWeb: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ds.spacing.md,
    },
    headerContentMobile: {
      width: '100%',
    },
    searchBar: {
      flex: 1,
    },
    searchBarMobile: {
      width: '100%',
    },
    closeButton: {
      width: 35,
      height: 35,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: ds.borderRadius.full,
      backgroundColor: scheme === 'dark' ? Palette.quickActionIcon : theme.surface,
      ...ds.shadows.sm,
    },
  });

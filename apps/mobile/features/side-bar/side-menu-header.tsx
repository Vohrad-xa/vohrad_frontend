import {View, TouchableOpacity, StyleSheet, Platform, StatusBar} from 'react-native';
import {BlurView} from 'expo-blur';
import Animated from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SearchBar} from '@/components/ui';
import type {ColorScheme} from '@/constants/colors';
import {Palette} from '@/constants/colors';
import type {DesignSystem} from '@/constants/typography';
import {useTheme} from '@/providers';
import {Icon, AppIcons} from '@/utils';
type ThemeType = ReturnType<typeof useTheme>['theme'];

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
      ? (StatusBar.currentHeight ?? 0) + ds.spacing.lg
      : Math.max(insets.top, ds.spacing.xl) + ds.spacing.xs;

  return (
    <Animated.View style={headerStyle}>
      <BlurView
        intensity={40}
        tint={scheme === 'dark' ? 'dark' : 'light'}
        style={[styles.headerBlurView, {paddingTop: topPadding}]}>
        <View style={styles.headerContent}>
          <SearchBar style={styles.searchBar} placeholder="Search" />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name={AppIcons.navigation.close} size={ds.iconSize.lg} />
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const createStyles = (theme: ThemeType, ds: typeof DesignSystem, scheme: ColorScheme) =>
  StyleSheet.create({
    headerBlurView: {
      paddingLeft: ds.spacing.xl,
      paddingRight: ds.spacing.xl,
      paddingVertical: ds.spacing.md,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    searchBar: {
      flex: 1,
    },
    closeButton: {
      width: 33,
      height: 33,
      marginLeft: ds.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: ds.borderRadius.full,
      backgroundColor: theme.background,
      ...ds.shadows.sm,
    },
  });

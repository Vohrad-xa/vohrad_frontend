import {View, Text, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import {BlurView} from 'expo-blur';
import type {ColorScheme} from '@/constants/colors';
import type {DesignSystem} from '@/constants/typography';
import {useTheme} from '@/providers';
import {Icon} from '@/utils';
type ThemeType = ReturnType<typeof useTheme>['theme'];

interface ProfileSectionProps {
  onPressSettings: () => void;
}

export function ProfileSection({onPressSettings}: ProfileSectionProps) {
  const {theme, ds, scheme} = useTheme();
  const styles = createStyles(theme, ds, scheme);

  const bottomPadding =
    Platform.OS === 'android' ? ds.spacing.xxxl : ds.spacing.lg;

  return (
    <BlurView
      intensity={20}
      tint={scheme === 'dark' ? 'dark' : 'light'}
      style={[styles.profileBlurView, {paddingBottom: bottomPadding}]}
    >
      <View style={styles.profileContainer}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AA</Text>
          </View>
          <Text style={styles.profileName}>Amine Abbouti</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={onPressSettings}
        >
          <Icon
            name="settings-outline"
            size={ds.iconSize.md}
            color={theme.muted}
          />
        </TouchableOpacity>
      </View>
    </BlurView>
  );
}

const createStyles = (
  theme: ThemeType,
  ds: typeof DesignSystem,
  _scheme: ColorScheme,
) =>
  StyleSheet.create({
    profileBlurView: {
      paddingTop: ds.spacing.xl,
      paddingHorizontal: ds.spacing.xl,
    },
    profileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: ds.spacing.xs,
    },
    profileInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatar: {
      width: ds.iconSize.xxl,
      height: ds.iconSize.xxl,
      borderRadius: ds.iconSize.xxl / 2,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: theme.primaryForeground,
      ...ds.typography.caption1,
      fontWeight: ds.fontWeight.semibold,
    },
    profileName: {
      flex: 1,
      color: theme.text,
      ...ds.typography.subheadline,
      fontWeight: ds.fontWeight.medium,
      marginLeft: ds.spacing.md,
    },
    settingsButton: {
      minWidth: ds.components.tapTarget.minSize,
      minHeight: ds.components.tapTarget.minSize,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: ds.spacing.md,
      marginRight: -ds.spacing.xs,
    },
  });

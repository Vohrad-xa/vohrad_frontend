import {View, Text, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import {BlurView} from 'expo-blur';
import type {ColorScheme} from '@/constants/colors';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme, useAuth} from '@/providers';
import type {InteractiveProps} from '@/types';
import {Icon} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';
import type {User} from '@vohrad/types';

interface ProfileSectionProps extends Pick<InteractiveProps, 'onPress'> {
  onPressSettings: () => void;
  onPressProfile: () => void;
}

export function ProfileSection({
  onPressSettings,
  onPressProfile,
}: ProfileSectionProps) {
  const {theme, ds, scheme} = useTheme();
  const {user}: {user: User | null} = useAuth();

  const bottomPadding =
    Platform.OS === 'android' ? ds.spacing.xxxl : ds.spacing.lg;

  const styles = createStyles(theme, ds, scheme, bottomPadding);

  // Generate initials from first and last name
  const getInitials = () => {
    const firstName = user?.first_name?.trim() ?? '';
    const lastName = user?.last_name?.trim() ?? '';

    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();

    if (firstInitial && lastInitial) {
      return `${firstInitial}${lastInitial}`;
    }
    return firstInitial ?? lastInitial ?? null;
  };

  // Get full name or fallback
  const getFullName = () => {
    const firstName = user?.first_name?.trim() ?? '';
    const lastName = user?.last_name?.trim() ?? '';

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }

    return firstName ?? lastName ?? user?.email ?? 'User';
  };

  const initials = getInitials();
  const fullName = getFullName();

  return (
    <BlurView
      intensity={20}
      tint={scheme === 'dark' ? 'dark' : 'light'}
      style={styles.profileBlurView}
    >
      <View style={styles.profileContainer}>
        <TouchableOpacity style={styles.profileInfo} onPress={onPressProfile}>
          {initials && (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <Text style={styles.profileName}>{fullName}</Text>
        </TouchableOpacity>
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

const createStyles = makeStyleFactory(
  (
    theme: ThemeShape,
    ds: DSShape,
    scheme: ColorScheme,
    bottomPadding: number,
  ) =>
    StyleSheet.create({
      profileBlurView: {
        paddingTop: ds.spacing.lg,
        paddingHorizontal: ds.spacing.xl,
        paddingBottom: bottomPadding,
      },
      profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: ds.spacing.lg,
      },
      profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
      },
      avatar: {
        width: ds.iconSize.xxl + 8,
        height: ds.iconSize.xxl + 8,
        borderRadius: (ds.iconSize.xxl + 8) / 2,
        backgroundColor: theme.primary,
        justifyContent: 'center',
        alignItems: 'center',
      },
      avatarText: {
        color: theme.primaryForeground,
        ...ds.typography.heading,
      },
      profileName: {
        flex: 1,
        color: theme.text,
        ...ds.typography.secondary,
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
    }),
  (theme, ds, scheme, bottomPadding) =>
    `${themeKey(theme, ds)}|${scheme}|${bottomPadding}`,
);

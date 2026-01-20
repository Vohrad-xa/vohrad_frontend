import React from 'react';
import {StyleSheet, Platform, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {List, Divider} from 'react-native-paper';
import {type TokenName} from '@/constants/colors';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {BiometricToggle, HapticToggle} from '@/features/settings';
import {useTheme} from '@/providers';
import {makeStyleFactory, Icon, AppIcons, type IconName} from '@/utils';

export default function AppSettingsScreen() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  const renderIcon = (iconName: IconName, colorToken?: TokenName) => {
    const IconWrapper = () => (
      <View style={styles.iconContainer}>
        <Icon
          name={iconName}
          colorToken={colorToken}
          withBackground={!!colorToken}
        />
      </View>
    );
    IconWrapper.displayName = 'IconWrapper';
    return IconWrapper;
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <List.Item
        style={styles.listItem}
        title="Biometric Unlock"
        description="Activate fingerprint or facial recognition "
        descriptionStyle={styles.description}
        titleStyle={styles.itemTitle}
        left={renderIcon(AppIcons.ui.biometric, 'accentGreen')}
        right={() => <BiometricToggle />}
      />

      {Platform.OS !== 'web' && (
        <>
          <Divider style={styles.divider} />
          <List.Item
            style={styles.listItem}
            title="Haptic Feedback"
            description="Enable haptic feedback to receive tactile responses"
            descriptionStyle={styles.description}
            titleStyle={styles.itemTitle}
            left={renderIcon(AppIcons.ui.haptic, 'destructive')}
            right={() => <HapticToggle />}
          />
        </>
      )}
    </ScrollView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        paddingHorizontal: ds.spacing.lg,
      },
      listItem: {
        paddingRight: 0,
      },
      itemTitle: {},
      iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      divider: {
        marginLeft: ds.spacing.xxxl,
      },
      description: {
        color: theme.muted,
        marginTop: ds.spacing.xs,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

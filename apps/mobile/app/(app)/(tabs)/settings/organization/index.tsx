import React from 'react';
import {StyleSheet, View, Platform} from 'react-native';
import {router} from 'expo-router';
import {ScrollView} from 'react-native-gesture-handler';
import {List, Divider} from 'react-native-paper';
import {type TokenName} from '@/constants/colors';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {ListSection} from '@/components/ui/list-section.ios';
import {Host, List as IOSList} from '@/modules/sykamore-ui/src/ios';
import {OrganizationHeaderInfo} from '@/features/settings/organization/components';
import {useTheme} from '@/providers';
import {makeStyleFactory, Icon, AppIcons} from '@/utils';

export default function OrganizationScreen() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  const menuItems = [
    {
      id: 'business',
      title: 'Business Details',
      icon: AppIcons.business.organization,
      color: 'accentBlue' as TokenName,
      route: '/settings/organization/business-details' as const,
    },
    {
      id: 'users',
      title: 'Users',
      icon: AppIcons.business.profile,
      color: 'accentGreen' as TokenName,
      route: '/settings/organization/users' as const,
    },
    {
      id: 'plan',
      title: 'Plan',
      icon: AppIcons.business.plan,
      color: 'accentOrange' as TokenName,
      route: '/settings/organization/plan' as const,
    },
  ] as const;

  const renderIcon = (iconName: string, colorToken?: TokenName) => {
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

  if (Platform.OS === 'ios') {
    return (
      <Host style={styles.container} matchContents>
        <IOSList listStyle="insetGrouped" showScrollIndicators={false}>
          <ListSection footer="Manage your organization's details, users, and plan information.">
            {menuItems.map((item) => (
              <ListSection.Row
                key={item.id}
                icon={item.icon}
                iconColorToken={item.color}
                title={item.title}
                onPress={() => router.push(item.route)}
              />
            ))}
          </ListSection>
        </IOSList>
      </Host>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <OrganizationHeaderInfo />

      {menuItems.map((item, index) => (
        <React.Fragment key={item.id}>
          <List.Item
            title={item.title}
            titleStyle={styles.itemTitle}
            left={renderIcon(item.icon, item.color)}
            onPress={() => router.push(item.route)}
          />
          {index < menuItems.length - 1 && <Divider style={styles.divider} />}
        </React.Fragment>
      ))}
    </ScrollView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        paddingHorizontal: Platform.OS === 'ios' ? undefined : ds.spacing.lg,
      },
      itemTitle: {
        ...ds.typography.label,
      },
      iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      divider: {
        marginLeft: ds.spacing.xl * 2 + ds.spacing.xs,
      },
    }),
  (ds, _theme) => themeKey(_theme, ds),
);

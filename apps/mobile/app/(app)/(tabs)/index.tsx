import {StyleSheet, View, Dimensions, ScrollView, Platform} from 'react-native';
import {
  InfoCard,
  RefreshableScrollView,
  ThemedText,
  ThemedView,
} from '@/components/ui';
import {usePlatformStyles} from '@/hooks';
import {useTheme} from '@/providers';
import type {MenuCard} from '@/types/ui';
import {Icon, AppIcons} from '@/utils';

export default function HomeScreen() {
  const {ds, theme} = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const cardWidth =
    (screenWidth - ds.layout.screenPadding * 2 - ds.spacing.md) / 2;

  const menuCards: MenuCard[] = [
    {
      title: 'Items',
      icon: AppIcons.inventory.items,
      count: 245,
      colorToken: 'accentBlue',
    },
    {
      title: 'Locations',
      icon: AppIcons.inventory.locations,
      count: 8,
      colorToken: 'accentYellow',
    },
    {
      title: 'Maintenance',
      icon: AppIcons.business.maintenance,
      count: 12,
      colorToken: 'accentOrange',
    },
    {
      title: 'Suppliers',
      icon: AppIcons.business.suppliers,
      count: 18,
      colorToken: 'accentGreen',
    },
    {
      title: 'Check In/Out',
      icon: AppIcons.actions.move,
      count: 3,
      colorToken: 'destructive',
    },
    {
      title: 'Documents',
      icon: AppIcons.content.document,
      count: 156,
      colorToken: 'accentIndigo',
    },
  ];

  const menuGridStyles = usePlatformStyles({
    web: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: ds.spacing.md,
    },
    mobile: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: ds.spacing.md,
    },
  });

  const cardStyles = usePlatformStyles({
    web: {
      height: ds.components.button.height * 2.3,
    },
    mobile: {
      height: ds.components.button.height * 2.3,
      width: cardWidth,
    },
  });

  const styles = StyleSheet.create({
    container: {
      padding: ds.layout.screenPadding,
    },
    cardContainer: {
      gap: ds.spacing.md,
    },
    cardContent: {
      flex: 1,
      padding: ds.spacing.md,
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    topSection: {
      alignSelf: 'flex-start',
      gap: ds.spacing.xs,
    },
    cardTitle: {
      fontWeight: ds.fontWeight.medium,
    },
    cardCount: {
      alignSelf: 'flex-start',
      fontWeight: ds.fontWeight.bold,
    },
    title: {
      marginTop: ds.spacing.lg,
      marginBottom: ds.spacing.md,
    },
  });

  const ScrollComponent =
    Platform.OS === 'web' ? ScrollView : RefreshableScrollView;

  return (
    <ScrollComponent
      bounces={Platform.OS !== 'web'}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={
        Platform.OS !== 'web' ? 'automatic' : undefined
      }
      style={{backgroundColor: theme.background, flex: 1}}
    >
      <View style={styles.container}>
        <ThemedText variant="heading" style={[styles.title, {marginTop: 0}]}>
          Quick Actions
        </ThemedText>
        <InfoCard />

        <ThemedText variant="heading" style={styles.title}>
          Overview
        </ThemedText>
        <View style={styles.cardContainer}>
          <View style={menuGridStyles}>
            {menuCards.map((card, i) => (
              <ThemedView
                key={i}
                variant="card"
                style={cardStyles}
                contentStyle={styles.cardContent}
              >
                <View style={styles.topSection}>
                  <Icon
                    name={card.icon}
                    size="lg"
                    colorToken={card.colorToken}
                  />
                  <ThemedText variant="secondary" style={styles.cardTitle}>
                    {card.title}
                  </ThemedText>
                </View>
                <ThemedText variant="heading" style={styles.cardCount}>
                  {card.count}
                </ThemedText>
              </ThemedView>
            ))}
          </View>
        </View>
      </View>
    </ScrollComponent>
  );
}

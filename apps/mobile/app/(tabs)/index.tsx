import { StyleSheet, View, Text, Platform, ScrollView } from 'react-native';
import { GlassCard } from '@/components/ui/glass-card';
import { InfoCard } from '@/components/ui/info-card';
import { DesignSystem } from '@/constants/typography';
import { useTypography } from '@/hooks/use-typography';
import { Icon, AppIcons } from '@/utils/icons';

export default function HomeScreen() {
  const typography = useTypography();

  const menuCards = [
    { title: 'Maintenance', icon: AppIcons.business.maintenance, count: 12 },
    { title: 'Items', icon: AppIcons.inventory.items, count: 245 },
    { title: 'Suppliers', icon: AppIcons.business.suppliers, count: 18 },
    { title: 'Locations', icon: AppIcons.inventory.locations, count: 8 },
    { title: 'Documents', icon: AppIcons.content.document, count: 156 },
    { title: 'Check In/Out', icon: 'log-in-outline' as const, count: 3 },
    { title: 'Reports', icon: AppIcons.business.reports, count: 24 },
    { title: 'Settings', icon: AppIcons.navigation.settings, count: 0 },
    { title: 'Labels', icon: AppIcons.business.equipment, count: 89 },
  ];

  return (
    <ScrollView bounces={true} bouncesZoom={false}>
      <View style={styles.container}>
        <InfoCard />
        <View style={styles.cardContainer}>
          <View style={styles.menuGrid}>
            {menuCards.map((card, i) => (
              <GlassCard key={i} style={styles.smallCard}>
                <View style={styles.cardContent}>
                  <View style={styles.topSection}>
                    <Icon name={card.icon} size="lg" />
                    <Text style={[typography.style('secondary'), styles.cardTitle]}>{card.title}</Text>
                  </View>
                  <Text style={[typography.style('headline'), styles.cardCount]}>{card.count}</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: DesignSystem.layout.screenPadding,
  },
  cardContainer: {
    gap: DesignSystem.spacing.md,
    marginTop: DesignSystem.spacing.md,
  },
  menuGrid: Platform.select({
    web: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: DesignSystem.spacing.md,
    } as any,
    default: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: DesignSystem.spacing.md,
    },
  }),
  smallCard: Platform.select({
    web: {
      height: 140,
    },
    default: {
      height: 100,
      flexBasis: '48%',
      maxWidth: '48%',
    },
  }),
  cardContent: {
    flex: 1,
    padding: DesignSystem.spacing.sm,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  topSection: {
    alignSelf: 'flex-start',
    gap: DesignSystem.spacing.xs,
  },
  cardTitle: {
    fontWeight: DesignSystem.fontWeight.medium,
  },
  cardCount: {
    alignSelf: 'flex-start',
    fontWeight: DesignSystem.fontWeight.bold,
  },
});

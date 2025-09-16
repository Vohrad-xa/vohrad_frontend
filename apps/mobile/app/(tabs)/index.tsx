import { StyleSheet, View, Text, Platform, ScrollView, ImageBackground } from 'react-native';
import { GlassCard } from '@/components/ui/glass-card';
import { InfoCard } from '@/components/ui/info-card';
import { DesignSystem } from '@/constants/typography';
import { useTypography } from '@/hooks/use-typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { getDefaultHeaderHeight } from '@react-navigation/elements';
import { Icon, AppIcons } from '@/utils/icons';

const testImage = require('../../assets/images/icon.png');

export default function HomeScreen() {
  const typography = useTypography();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const headerHeight = getDefaultHeaderHeight({ width, height }, false, insets.top);

  const menuCards = [
    { title: 'Maintenance', icon: AppIcons.business.maintenance },
    { title: 'Items', icon: AppIcons.inventory.items },
    { title: 'Suppliers', icon: AppIcons.business.suppliers },
    { title: 'Locations', icon: AppIcons.inventory.locations },
    { title: 'Documents', icon: AppIcons.content.document },
    { title: 'Check In/Out', icon: 'log-in-outline' as const },
    { title: 'Reports', icon: AppIcons.business.reports },
    { title: 'Settings', icon: AppIcons.navigation.settings },
    { title: 'Labels', icon: AppIcons.business.equipment },
    { title: 'Events', icon: AppIcons.business.suppliers },
    { title: 'Profile', icon: AppIcons.navigation.profile },
  ];

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + DesignSystem.spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.cardContainer}>
        <InfoCard />
        <View style={styles.menuGrid}>
          {menuCards.map((card, i) => (
            <GlassCard key={i} style={styles.smallCard}>
              <View style={styles.cardContent}>
                <Icon name={card.icon} size="lg" />
                <Text style={[typography.style('tertiary'), styles.cardTitle]}>{card.title}</Text>
              </View>
            </GlassCard>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: DesignSystem.layout.screenPadding,
    paddingBottom: DesignSystem.spacing.xl,
  },
  cardContainer: {
    gap: DesignSystem.spacing.md,
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
      flex: 1,
      height: 80,
      flexBasis: '30%',
    },
  }),
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignSystem.spacing.sm,
  },
  cardTitle: {
    textAlign: 'center',
    fontWeight: '500',
  },
});

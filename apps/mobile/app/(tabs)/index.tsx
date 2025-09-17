import { StyleSheet, View, Platform, ScrollView } from 'react-native';
import { InfoCard } from '@/components/ui/info-card';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useTheme } from '@/providers/theme-provider';
import { Icon, AppIcons } from '@/utils/icons';

export default function HomeScreen() {
  const { ds } = useTheme();

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

  const styles = StyleSheet.create({
    container: {
      padding: ds.layout.screenPadding,
    },
    cardContainer: {
      gap: ds.spacing.md,
      marginTop: ds.spacing.md,
    },
    menuGrid: Platform.select({
      web: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: ds.spacing.md,
      } as any,
      default: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: ds.spacing.md,
      },
    }),
    smallCard: Platform.select({
      web: {
        height: ds.components.card.borderRadius * 17.5,
      },
      default: {
        height: ds.components.button.height * 2.3,
        flexBasis: '48%',
        maxWidth: '48%',
      },
    }),
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
  });

  return (
    <ScrollView bounces bouncesZoom={false}>
      <View style={styles.container}>
        <InfoCard />

        <View style={styles.cardContainer}>
          <View style={styles.menuGrid}>
            {menuCards.map((card, i) => (
              <ThemedView key={i} variant="card" style={styles.smallCard}>
                <ThemedView variant="cardContent">
                  <View style={styles.topSection}>
                    <Icon name={card.icon} size="lg" />
                    <ThemedText variant="secondary" style={styles.cardTitle}>
                      {card.title}
                    </ThemedText>
                  </View>
                  <ThemedText variant="headline" style={styles.cardCount}>
                    {card.count}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

import {
  StyleSheet,
  View,
  Dimensions,
  ScrollView,
  Platform,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import {userApi} from '@vohrad/api-client';
import {useAuthStore} from '@vohrad/store';
import {RefreshableScrollView, ThemedText, ThemedView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {QuickActions} from '@/features/quick-actions';
import {useTheme} from '@/providers';
import type {MenuCard} from '@/types/ui';
import {Icon, AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

export default function HomeScreen() {
  const {ds, theme} = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const styles = createStyles(ds, theme, screenWidth);
  const setUser = useAuthStore((state) => state.setUser);

  const handleRefresh = async () => {
    try {
      const updatedUser = await userApi.getUserProfile();
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

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

  const menuGridStyles = Platform.select({
    web: styles.menuGridWeb,
    default: styles.menuGridMobile,
  });

  const cardStyles = Platform.select({
    web: styles.cardWeb,
    default: styles.cardMobile,
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
      style={styles.scrollView}
      {...(Platform.OS !== 'web' && {onRefresh: handleRefresh})}
    >
      <View style={styles.container}>
        <ThemedText
          variant="heading"
          style={[styles.title, styles.titleNoMarginTop]}
        >
          Quick Actions
        </ThemedText>
        <QuickActions />

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

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape, screenWidth: number) => {
    const cardWidth =
      (screenWidth - ds.layout.screenPadding * 2 - ds.spacing.md) / 2;

    return StyleSheet.create({
      scrollView: {
        backgroundColor: theme.background,
        flex: 1,
      } as ViewStyle,
      container: {
        padding: ds.layout.screenPadding,
      } as ViewStyle,
      title: {
        marginTop: ds.spacing.lg,
        marginBottom: ds.spacing.md,
      } as TextStyle,
      titleNoMarginTop: {
        marginTop: 0,
      } as TextStyle,
      cardContainer: {
        gap: ds.spacing.md,
      } as ViewStyle,
      cardContent: {
        flex: 1,
        padding: ds.spacing.md,
        flexDirection: 'column',
        justifyContent: 'space-between',
      } as ViewStyle,
      topSection: {
        alignSelf: 'flex-start',
        gap: ds.spacing.xs,
      } as ViewStyle,
      cardTitle: {
        fontWeight: ds.fontWeight.medium,
      } as TextStyle,
      cardCount: {
        alignSelf: 'flex-start',
        fontWeight: ds.fontWeight.bold,
      } as TextStyle,
      menuGridWeb: {
        ...Platform.select({
          web: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          },
        }),
        gap: ds.spacing.md,
      } as ViewStyle,
      menuGridMobile: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: ds.spacing.md,
      } as ViewStyle,
      cardWeb: {
        height: ds.components.button.height * 2.3,
      } as ViewStyle,
      cardMobile: {
        height: ds.components.button.height * 2.3,
        width: cardWidth,
      } as ViewStyle,
    });
  },
  (ds, theme, screenWidth) => themeKey(theme, ds) + `|${screenWidth}`,
);

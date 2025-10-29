import React from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Pressable,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import {useRouter} from 'expo-router';
import {ThemedText, ThemedView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon, AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';
import {useFilterContext} from './filter-context';

type OverviewCardsProps = {
  onFilterPress?: () => void;
  screenWidth: number;
};

export function OverviewCards({
  onFilterPress,
  screenWidth,
}: OverviewCardsProps) {
  const {ds, theme} = useTheme();
  const router = useRouter();
  const styles = createStyles(ds, theme, screenWidth);

  // Get visibility state and filtered cards
  const {visibility, getFilteredCards} = useFilterContext();
  const menuCards = getFilteredCards();

  // Handle card press navigation
  const handleCardPress = (cardTitle: string) => {
    switch (cardTitle) {
      case 'Items':
        router.push('/(app)/(tabs)/home/items');
        break;
      // Add other navigation cases here if needed in the future
      default:
        break;
    }
  };

  const menuGridStyles = Platform.select({
    web: styles.menuGridWeb,
    default: styles.menuGridMobile,
  });

  const cardStyles = Platform.select({
    web: styles.cardWeb,
    default: styles.cardMobile,
  });

  const hasActiveFilters =
    !visibility.items ||
    !visibility.locations ||
    !visibility.maintenance ||
    !visibility.suppliers ||
    !visibility.checkInOut ||
    !visibility.documents;

  return (
    <>
      <View style={styles.overviewHeader}>
        <ThemedText variant="heading" style={styles.title}>
          Overview
        </ThemedText>
        <View style={styles.headerRight}>
          {hasActiveFilters && (
            <ThemedText variant="body" style={styles.filterStatus}>
              {menuCards.length} of 6
            </ThemedText>
          )}
          <Pressable onPress={onFilterPress}>
            <Icon
              name={AppIcons.navigation.filter}
              size="lg"
              colorToken="text"
            />
          </Pressable>
        </View>
      </View>
      <View style={styles.cardContainer}>
        <View style={menuGridStyles}>
          {menuCards.map((card, i) => (
            <Pressable
              key={i}
              onPress={() => handleCardPress(card.title)}
              style={cardStyles}
            >
              <ThemedView
                variant="card"
                style={styles.cardInner}
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
            </Pressable>
          ))}
        </View>
      </View>
    </>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape, screenWidth: number) => {
    const cardWidth =
      (screenWidth - ds.layout.screenPadding * 2 - ds.spacing.md) / 2;

    return StyleSheet.create({
      overviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: ds.spacing.lg,
        marginBottom: ds.spacing.md,
      },
      headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ds.spacing.sm,
      },
      title: {} as TextStyle,
      filterStatus: {
        fontSize: 12,
        color: theme.muted,
      },
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
        backgroundColor: 'none',
      } as ViewStyle,
      cardInner: {
        flex: 1,
      } as ViewStyle,
    });
  },
  (ds, theme, screenWidth) => themeKey(theme, ds) + `|${screenWidth}`,
);

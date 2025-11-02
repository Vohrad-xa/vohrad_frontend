import React, {useCallback} from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Pressable,
  type ViewStyle,
} from 'react-native';
import {useRouter} from 'expo-router';
import {ThemedText, ThemedView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon, AppIcons, makeStyleFactory} from '@/utils';
import {
  useFilteredDashboardCards,
  useDashboardCardVisibility,
} from './filter-context';

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
  const isWeb = Platform.OS === 'web';
  const isAndroid = Platform.OS === 'android';
  const isFeedbackEnabled = isAndroid || isWeb;

  // Get visibility state and filtered cards
  const visibility = useDashboardCardVisibility();
  const menuCards = useFilteredDashboardCards();

  // Handle card press navigation
  const handleCardPress = useCallback(
    (cardTitle: string) => {
      switch (cardTitle) {
        case 'Items':
          router.push('/(app)/(tabs)/items');
          break;
        // Other navigation cases
        default:
          break;
      }
    },
    [router],
  );

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
        <ThemedText variant="heading">Overview</ThemedText>
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
        <View style={styles.menuGrid}>
          {menuCards.map((card, i) => (
            <Pressable
              key={i}
              onPress={() => handleCardPress(card.title)}
              android_ripple={
                isAndroid
                  ? {
                      color: `${theme.highlight}`,
                      borderless: false,
                      radius: ds.components.card.borderRadius,
                    }
                  : undefined
              }
              style={({pressed, hovered}) => [
                styles.cardWrapper,
                hovered && isWeb ? styles.cardWrapperHover : null,
                pressed && isFeedbackEnabled ? styles.cardWrapperPressed : null,
              ]}
            >
              <ThemedView
                variant="card"
                style={styles.card}
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

    const menuGridWeb = {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: ds.spacing.md,
    };

    const menuGridMobile = {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: ds.spacing.md,
    };

    const cardBorderRadius = ds.components.card.borderRadius;
    const isAndroid = Platform.OS === 'android';

    const sharedCardWrapper: ViewStyle = {
      borderRadius: cardBorderRadius,
      overflow: isAndroid ? 'hidden' : 'visible',
    };

    const cardWrapperWeb = {
      ...sharedCardWrapper,
      height: ds.components.button.height * 2.3,
      cursor: 'pointer',
      transitionProperty: 'transform, box-shadow, opacity',
      transitionDuration: '120ms',
      transitionTimingFunction: 'ease-out',
    } as ViewStyle;

    const cardWrapperMobile: ViewStyle = {
      ...sharedCardWrapper,
      height: ds.components.button.height * 2.3,
      width: cardWidth,
      backgroundColor: 'transparent',
    };

    const isWeb = Platform.OS === 'web';

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
      filterStatus: {
        fontSize: 12,
        color: theme.muted,
      },
      cardContainer: {
        gap: ds.spacing.md,
      } as ViewStyle,
      menuGrid: (isWeb ? menuGridWeb : menuGridMobile) as ViewStyle,
      cardWrapper: (isWeb ? cardWrapperWeb : cardWrapperMobile) as ViewStyle,
      cardWrapperPressed: {
        opacity: isWeb ? 0.98 : 0.94,
        transform: [{scale: isWeb ? 0.998 : 0.985}],
        shadowColor: theme.background,
        shadowOpacity: isWeb ? 0.06 : 0.12,
        shadowRadius: ds.spacing.sm,
        shadowOffset: {width: 0, height: ds.spacing.xs},
        elevation: 1,
        borderRadius: cardBorderRadius,
      } as ViewStyle,
      cardWrapperHover: isWeb
        ? ({
            transform: [{scale: 0.99}],
            boxShadow: '0 6px 12px rgba(17, 24, 28, 0.09)',
          } as unknown as ViewStyle)
        : ({} as ViewStyle),
      card: {
        flex: 1,
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
      } as ViewStyle,
      cardTitle: {
        fontWeight: ds.fontWeight.medium,
      },
      cardCount: {
        alignSelf: 'flex-start',
        fontWeight: ds.fontWeight.bold,
      },
    });
  },
  (ds, theme, screenWidth) => `${themeKey(theme, ds)}|${screenWidth}`,
);

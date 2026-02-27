import React, {useCallback} from 'react';
import {StyleSheet, View, Platform, useWindowDimensions} from 'react-native';
import {useRouter} from 'expo-router';
import {Card} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon, makeStyleFactory} from '@/utils';
import {useFilteredDashboardCards} from '../hooks';

const MIN_CARD_WIDTH = 200;

export function OverviewCards() {
  const {ds, theme} = useTheme();
  const router = useRouter();
  const {width: screenWidth} = useWindowDimensions();
  const styles = createStyles(ds, theme, screenWidth);
  const menuCards = useFilteredDashboardCards();

  const handleCardPress = useCallback(
    (cardTitle: string) => {
      switch (cardTitle) {
        case 'Items':
          router.push('/(tabs)/items');
          break;
        case 'Vault':
          router.push('/(tabs)/vault');
          break;
        default:
          break;
      }
    },
    [router],
  );

  return (
    <>
      <View style={styles.header}>
        <ThemedText variant="title3" fontWeight="semibold">
          Overview
        </ThemedText>
      </View>
      <View style={styles.grid}>
        {menuCards.map((card) => (
          <Card
            key={card.title}
            mode="contained"
            onPress={() => handleCardPress(card.title)}
            style={styles.card}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.topSection}>
                <Icon name={card.icon} size="lg" />
                <ThemedText variant="subheadline" colorToken="muted">
                  {card.title}
                </ThemedText>
              </View>
              <ThemedText variant="subheadline" fontWeight="bold">
                {card.count}
              </ThemedText>
            </Card.Content>
          </Card>
        ))}
      </View>
    </>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape, screenWidth: number) => {
    const gap = ds.spacing.md;
    const padding = ds.layout.screenPadding;
    const isWeb = Platform.OS === 'web';
    const numColumns = isWeb
      ? Math.max(
          2,
          Math.floor(
            (screenWidth - padding * 2 + gap) / (MIN_CARD_WIDTH + gap),
          ),
        )
      : 2;
    const cardWidth =
      (screenWidth - padding * 2 - (numColumns - 1) * gap) / numColumns;

    return StyleSheet.create({
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: ds.spacing.lg,
        marginBottom: ds.spacing.md,
      },
      grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap,
      },
      card: {
        width: cardWidth,
        borderRadius: ds.borderRadius.xxxl,
        backgroundColor: theme.card,
      },
      cardContent: {
        gap: ds.spacing.md,
      },
      topSection: {
        gap: ds.spacing.xs,
      },
    });
  },
  (ds, theme, screenWidth) => `${themeKey(theme, ds)}|${screenWidth}`,
);

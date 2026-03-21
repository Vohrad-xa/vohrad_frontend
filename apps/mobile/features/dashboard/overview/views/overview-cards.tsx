import React, {useCallback} from 'react';
import {StyleSheet, View, Platform, useWindowDimensions} from 'react-native';
import {useRouter} from 'expo-router';
import {Avatar, Card} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {Palette} from '@/constants';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';
import {useFilteredDashboardCards} from '../hooks';

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
        case 'Locations':
          router.push('/(tabs)/locations');
          break;
      }
    },
    [router],
  );

  return (
    <>
      <View style={styles.header}>
        <ThemedText variant="title1" fontWeight="semibold">
          Overview
        </ThemedText>
      </View>
      <View style={styles.grid}>
        {menuCards.map((card) => {
          const icon =
            Platform.OS === 'ios' ? (card.iosIcon ?? card.icon) : card.icon;

          return (
            <Card
              key={card.title}
              mode="contained"
              onPress={() => handleCardPress(card.title)}
              style={styles.card}
            >
              <Card.Content style={styles.cardContent}>
                <View style={styles.topRow}>
                  <Avatar.Icon
                    size={32}
                    icon={icon}
                    color={Palette.white}
                    style={{
                      backgroundColor: theme[card.iconBackgroundColor],
                    }}
                  />
                  <ThemedText
                    variant={Platform.OS === 'ios' ? 'label' : 'body'}
                    colorToken="muted"
                    fontWeight="semibold"
                  >
                    {card.count}
                  </ThemedText>
                </View>
                <ThemedText
                  variant={Platform.OS === 'ios' ? 'subheadline' : 'label'}
                  fontWeight="medium"
                >
                  {card.title}
                </ThemedText>
              </Card.Content>
            </Card>
          );
        })}
      </View>
    </>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape, screenWidth: number) => {
    const gap = ds.spacing.sm;
    const padding = ds.layout.screenPadding;
    const isWeb = Platform.OS === 'web';
    const numColumns = 2;
    const cardMinWidth = 200;
    const mobileCardWidth =
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
        ...(isWeb
          ? {
              flexGrow: 1,
              flexShrink: 1,
              flexBasis: cardMinWidth,
              minWidth: cardMinWidth,
            }
          : {width: mobileCardWidth}),
        borderRadius: ds.components.card.borderRadius,
      },
      cardContent: {
        gap: ds.spacing.md,
        paddingHorizontal: ds.spacing.md,
        paddingVertical: ds.spacing.md,
      },
      topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
    });
  },
  (ds, theme, screenWidth) => `${themeKey(theme, ds)}|${screenWidth}`,
);

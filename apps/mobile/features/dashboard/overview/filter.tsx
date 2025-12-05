import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, ThemedText, Toggle} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import {useDashboardCardControls} from './filter-context';

export function FilterContent() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  const {visibility, setCardVisibility, cardConfig} =
    useDashboardCardControls();

  return (
    <>
      <Card>
        {cardConfig.map((card, index) => {
          const visibilityKey = card.key;
          const isVisible = visibility[visibilityKey];

          return (
            <React.Fragment key={visibilityKey}>
              <Card.Row
                icon={card.icon}
                hideChevron
                accessibilityLabel={`Toggle ${card.title} card`}
              >
                <View style={styles.rowContent}>
                  <ThemedText variant="label" style={styles.label}>
                    {card.title}
                  </ThemedText>
                  <Toggle
                    value={isVisible}
                    onValueChange={(value) =>
                      setCardVisibility(visibilityKey, value)
                    }
                    accessibilityLabel={`Toggle ${card.title} card`}
                  />
                </View>
              </Card.Row>
              {index < cardConfig.length - 1 && <Card.Divider withIconOffset />}
            </React.Fragment>
          );
        })}
      </Card>
      <ThemedText variant="footnote" style={styles.description}>
        You can choose your preferred overview cards to be displayed on the home
      </ThemedText>
    </>
  );
}

export default FilterContent;

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      description: {
        marginVertical: ds.spacing.lg,
        paddingHorizontal: ds.spacing.xl,
      },
      rowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
      },
      label: {
        flex: 1,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

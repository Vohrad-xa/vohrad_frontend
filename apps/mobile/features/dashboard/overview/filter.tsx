import React from 'react';
import {StyleSheet, Platform, View} from 'react-native';
import {Card, List, Switch} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {Switch as AndroidSwitch} from '@/modules/sykamore-ui/src/android';
import {
  Host,
  List as IOSList,
  Switch as IOSSwitch,
  Section,
  Text,
} from '@/modules/sykamore-ui/src/ios';
import {useTheme} from '@/providers';
import {Icon} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';
import {useDashboardCardControls} from './filter-context';

export function FilterContent() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  const {visibility, setCardVisibility, cardConfig} =
    useDashboardCardControls();

  if (Platform.OS === 'ios') {
    return (
      <Host style={styles.hostContainer} matchContents>
        <IOSList listStyle="insetGrouped" showScrollIndicators={false}>
          <Section
            footer={
              <Text>
                You can choose your preferred overview cards to be displayed on
                the dashboard.
              </Text>
            }
          >
            {cardConfig.map((card) => {
              const visibilityKey = card.key;
              const isVisible = visibility[visibilityKey];

              return (
                <IOSSwitch
                  key={visibilityKey}
                  value={isVisible}
                  onValueChange={(value) =>
                    setCardVisibility(visibilityKey, value)
                  }
                  label={card.title}
                  icon={<Icon name={card.icon} />}
                />
              );
            })}
          </Section>
        </IOSList>
      </Host>
    );
  }

  return (
    <View style={styles.hostContainer}>
      <Card.Content style={styles.cardContent}>
        {cardConfig.map((card) => {
          const visibilityKey = card.key;
          const isVisible = visibility[visibilityKey];

          return (
            <React.Fragment key={visibilityKey}>
              <List.Item
                style={styles.listItem}
                title={card.title}
                titleStyle={styles.label}
                accessibilityLabel={`Toggle ${card.title} card`}
                left={() => (
                  <View style={styles.iconContainer}>
                    <Icon name={card.icon} colorToken="muted" size="lg" />
                  </View>
                )}
                right={() =>
                  Platform.OS === 'android' ? (
                    <AndroidSwitch
                      value={isVisible}
                      onValueChange={(value) =>
                        setCardVisibility(visibilityKey, value)
                      }
                      variant="switch"
                      scale={0.8}
                    />
                  ) : (
                    <Switch
                      value={isVisible}
                      onValueChange={(value) =>
                        setCardVisibility(visibilityKey, value)
                      }
                    />
                  )
                }
              />
            </React.Fragment>
          );
        })}
      </Card.Content>
      <ThemedText variant="caption" style={styles.description}>
        You can choose your preferred overview cards to be displayed on the
        dashboard.
      </ThemedText>
    </View>
  );
}

export default FilterContent;

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      hostContainer: {
        flex: 1,
        paddingHorizontal: Platform.OS === 'ios' ? undefined : ds.spacing.sm,
      },
      card: {
        borderRadius: ds.components.card.borderRadius,
        backgroundColor: theme.input,
      },
      cardContent: {},
      iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      listItem: {
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
      },

      divider: {
        marginLeft: ds.spacing.xl * 2,
      },
      description: {
        marginVertical: ds.spacing.lg,
        paddingHorizontal: ds.spacing.xl,
      },
      label: {
        fontSize: ds.typography.label.fontSize,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

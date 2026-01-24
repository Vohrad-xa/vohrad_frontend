import React from 'react';
import {StyleSheet, Platform, View} from 'react-native';
import {List, Surface} from 'react-native-paper';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';
import {Switch as AndroidSwitch} from 'sykamore-ui/android';
import {
  Host,
  List as IOSList,
  Toggle as IOSToggle,
  Section,
  Text,
} from 'sykamore-ui/ios';
import {useDashboardCardControls} from './filter-context';
import type {SFSymbol} from 'sf-symbols-typescript';

export function FilterContent() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  const {visibility, setCardVisibility, cardConfig} =
    useDashboardCardControls();

  if (Platform.OS === 'ios') {
    return (
      <Host style={styles.container}>
        <IOSList listStyle="automatic">
          <Section
            title="Overview Cards"
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
                <IOSToggle
                  key={visibilityKey}
                  isOn={isVisible}
                  onIsOnChange={(value) =>
                    setCardVisibility(visibilityKey, value)
                  }
                  label={card.title}
                  systemImage={card.icon as SFSymbol}
                />
              );
            })}
          </Section>
        </IOSList>
      </Host>
    );
  }

  return (
    <View style={styles.container}>
      <Surface elevation={1} mode="flat" style={styles.surface}>
        {cardConfig.map((card) => {
          const visibilityKey = card.key;
          const isVisible = visibility[visibilityKey];

          return (
            <List.Item
              key={visibilityKey}
              style={styles.itemList}
              title={card.title}
              accessibilityLabel={`Toggle ${card.title} card`}
              left={() => (
                <Icon name={card.icon} style={styles.iconContainer} />
              )}
              right={() => (
                <AndroidSwitch
                  value={isVisible}
                  onValueChange={(value) =>
                    setCardVisibility(visibilityKey, value)
                  }
                  variant="switch"
                  scale={0.8}
                />
              )}
            />
          );
        })}
      </Surface>
    </View>
  );
}

export default FilterContent;

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        padding: ds.spacing.md,
      },
      surface: {
        borderRadius: ds.borderRadius.xxxl,
      },
      itemList: {
        paddingRight: ds.spacing.sm,
        paddingTop: 0,
        paddingBottom: 0,
      },
      iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: ds.spacing.md,
      },
    }),
  (ds, _theme) => themeKey(_theme, ds),
);

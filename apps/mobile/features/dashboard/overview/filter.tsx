import {StyleSheet, Platform, View} from 'react-native';
import {ListRow, ListRows} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useTheme} from '@/providers';
import {Icon, makeStyleFactory} from '@/utils';
import {Switch as AndroidSwitch} from 'sykamore-ui/android';
import {
  Host,
  List as IOSList,
  Toggle as IOSToggle,
  Section,
  Text,
} from 'sykamore-ui/ios';
import {useDashboardCardControls} from './filter-context';

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
                  systemImage={card.icon}
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
      <ListRows>
        {cardConfig.map((card) => {
          const visibilityKey = card.key;
          const isVisible = visibility[visibilityKey];

          return (
            <ListRow
              key={visibilityKey}
              rowKey={visibilityKey}
              title={card.title}
              a11yLabel={`Toggle ${card.title} card`}
              a11yHint={`Show or hide ${card.title} on dashboard`}
              left={(props) => <Icon name={card.icon} style={props.style} />}
              right={() => (
                <AndroidSwitch
                  value={isVisible}
                  onValueChange={(value) =>
                    setCardVisibility(visibilityKey, value)
                  }
                  variant="switch"
                  scale={0.85}
                />
              )}
              style={styles.itemList}
            />
          );
        })}
      </ListRows>
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

      itemList: {
        paddingTop: ds.spacing.xxs,
        paddingBottom: ds.spacing.xxs,
      },
    }),
  (ds, _theme) => themeKey(_theme, ds),
);

import * as React from 'react';
import {View} from 'react-native';
import {List, Switch} from 'react-native-paper';
import {Palette} from '@/constants';
import {useDashboardCardControls} from './filter-context';

export function FilterContent() {
  const {visibility, setCardVisibility, cardConfig} =
    useDashboardCardControls();

  return (
    <View>
      <List.Section title="you can customize your dashboard cards by toggling them on or off below:">
        {cardConfig.map((card) => {
          const visibilityKey = card.key;
          const isVisible = !!visibility[visibilityKey];

          return (
            <React.Fragment key={visibilityKey}>
              <List.Item
                title={card.title}
                accessibilityLabel={`Toggle ${card.title} card`}
                left={(props) => <List.Icon {...props} icon={card.icon} />}
                right={() => (
                  <Switch
                    color={Palette.bluepurple}
                    value={isVisible}
                    onValueChange={(value) =>
                      setCardVisibility(visibilityKey, value)
                    }
                  />
                )}
              />
            </React.Fragment>
          );
        })}
      </List.Section>
    </View>
  );
}

export default FilterContent;

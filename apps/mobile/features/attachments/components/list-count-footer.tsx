import React, {memo} from 'react';
import {View, type StyleProp, type ViewStyle} from 'react-native';
import {Divider} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import type {Typography} from '@/constants';

export type ListCountFooterProps = {
  count: number;
  dividerStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  textVariant?: Typography;
};

export const ListCountFooter = memo<ListCountFooterProps>(
  ({count, dividerStyle, containerStyle, textVariant = 'value'}) => {
    return (
      <View
        accessible
        accessibilityLabel={`${count} ${count === 1 ? 'item' : 'items'}`}
        testID="list-count-footer"
      >
        <Divider style={dividerStyle} />
        <View
          style={containerStyle}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <ThemedText variant={textVariant}>
            {count === 1 ? '1 item' : `${count} items`}
          </ThemedText>
        </View>
      </View>
    );
  },
);

ListCountFooter.displayName = 'ListCountFooter';

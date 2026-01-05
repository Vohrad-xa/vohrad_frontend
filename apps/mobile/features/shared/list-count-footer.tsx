import React, {memo} from 'react';
import {
  View,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import {Divider} from 'react-native-paper';
import {ThemedText, type ThemedTextProps} from '@/components/ui';
import type {Typography} from '@/constants';

export type ListCountFooterProps = {
  count: number;
  dividerStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  textVariant?: Typography;
  fontWeight?: ThemedTextProps['fontWeight'];
};

export const ListCountFooter = memo<ListCountFooterProps>(
  ({
    count,
    textStyle,
    dividerStyle,
    containerStyle,
    textVariant = 'value',
    fontWeight,
  }) => {
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
          <ThemedText
            variant={textVariant}
            fontWeight={fontWeight}
            style={textStyle}
          >
            {count === 1 ? '1 item' : `${count} items`}
          </ThemedText>
        </View>
      </View>
    );
  },
);

ListCountFooter.displayName = 'ListCountFooter';

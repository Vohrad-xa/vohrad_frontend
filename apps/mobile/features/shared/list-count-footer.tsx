import {memo} from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import {Divider} from 'react-native-paper';
import {ThemedText, type ThemedTextProps} from '@/components/ui';
import {
  themeKey,
  type DSShape,
  type ThemeShape,
  type Typography,
} from '@/constants';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

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
    const {ds, theme} = useTheme();
    const styles = createStyles(ds, theme);

    return (
      <View
        accessible
        accessibilityLabel={`${count} ${count === 1 ? 'item' : 'items'}`}
        testID="list-count-footer"
      >
        <Divider style={[styles.divider, dividerStyle]} />
        <View
          style={[styles.container, containerStyle]}
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

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        paddingVertical: ds.spacing.xxl,
        alignItems: 'center',
      },
      divider: {
        marginBottom: ds.spacing.md,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

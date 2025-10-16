import type {FC} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme} from '@/providers';
import {Icon} from '@/utils';
import {ThemedText} from './themed-text';
import {makeStyleFactory} from '@/utils/style-factory';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import type {ListItemBaseProps} from '@/types';

export type ListItemProps = ListItemBaseProps;

const ListItem: FC<ListItemProps> = ({
  label,
  icon,
  onPress,
  isDestructive,
  children,
  style,
  accessibilityLabel,
  testID,
}) => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  const content = (
    <>
      {icon && (
        <View style={styles.iconContainer}>
          <Icon
            name={icon}
            color={isDestructive ? theme.iconDanger : undefined}
          />
        </View>
      )}
      <ThemedText
        style={[styles.labelText, isDestructive && styles.labelTextDestructive]}
      >
        {label}
      </ThemedText>
      {children}
    </>
  );

  return onPress ? (
    <TouchableOpacity
      style={[styles.listItem, style]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      testID={testID}
    >
      {content}
    </TouchableOpacity>
  ) : (
    <View style={[styles.listItem, style]} testID={testID}>
      {content}
    </View>
  );
};

ListItem.displayName = 'ListItem';

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: ds.spacing.md,
      },
      iconContainer: {
        marginRight: ds.spacing.lg,
        width: ds.iconSize.md,
        alignItems: 'center',
      },
      labelText: {
        flex: 1,
        ...ds.typography.body,
        fontWeight: ds.fontWeight.medium,
      },
      labelTextDestructive: {
        color: theme.iconDanger,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

export default ListItem;

import React from 'react';
import {View, TouchableOpacity, StyleSheet, type StyleProp, type ViewStyle} from 'react-native';
import {ThemedText} from './themed-text';
import {useTheme} from '@/providers';
import {Icon, type IconName} from '@/utils';

export interface ListItemProps {
  label: string;
  icon?: IconName;
  onPress?: () => void;
  isDestructive?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const ListItem = React.memo(({label, icon, onPress, isDestructive, children, style}: ListItemProps) => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  const content = (
    <>
      {icon && (
        <View style={styles.iconContainer}>
          <Icon name={icon} size={ds.iconSize.md} color={isDestructive ? theme.iconDanger : undefined} />
        </View>
      )}
      <ThemedText style={[styles.labelText, isDestructive && {color: theme.iconDanger}]}>{label}</ThemedText>
      {children}
    </>
  );

  return onPress ? (
    <TouchableOpacity style={[styles.listItem, style]} onPress={onPress}>
      {content}
    </TouchableOpacity>
  ) : (
    <View style={[styles.listItem, style]}>{content}</View>
  );
});

const createStyles = (ds: any, theme: any) =>
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
  });

export default ListItem;

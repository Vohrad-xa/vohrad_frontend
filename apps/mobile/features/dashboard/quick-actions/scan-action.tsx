import React from 'react';
import {
  TouchableOpacity,
  View,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import {ThemedText} from '@/components/ui';
import {useTheme} from '@/providers';
import {Icon} from '@/utils';
import type {IconName} from '@/utils/icons';

type ScanQuickActionProps = {
  icon: IconName;
  label: string;
  actionStyles: {
    actionButton: ViewStyle;
    iconContainer: ViewStyle;
    actionLabel: TextStyle;
  };
  onScanPress?: () => void;
};

export function ScanQuickAction({
  icon,
  label,
  actionStyles,
  onScanPress,
}: ScanQuickActionProps) {
  const {ds} = useTheme();

  return (
    <TouchableOpacity style={actionStyles.actionButton} onPress={onScanPress}>
      <View style={actionStyles.iconContainer}>
        <Icon name={icon} size={ds.iconSize.xl} colorToken="quickActionIcon" />
      </View>
      <ThemedText variant="subheadline" style={actionStyles.actionLabel}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

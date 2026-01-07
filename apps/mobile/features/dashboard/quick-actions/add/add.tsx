import React, {useCallback, useMemo, useState} from 'react';
import {
  TouchableOpacity,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {SykaMenuView, type SykaMenuAction} from 'syka-menu';
import {ThemedText} from '@/components/ui';
import {useTheme} from '@/providers';
import {Icon, type IconName} from '@/utils';

const TEMPLATE_OPTIONS = [
  {label: 'Item', key: 'item'},
  {label: 'Location', key: 'location'},
  {label: 'Document', key: 'document'},
  {label: 'Image', key: 'image'},
  {label: 'Maintenance', key: 'maintenance'},
  {label: 'Note', key: 'note'},
  {label: 'Task', key: 'task'},
  {label: 'Event', key: 'event'},
] as const;

type TemplateKey = (typeof TEMPLATE_OPTIONS)[number]['key'];

type AddQuickActionProps = {
  icon: IconName;
  label: string;
  containerRef?: React.RefObject<View | null>;
  actionStyles: QuickActionStyleBundle;
};

export function AddQuickAction({
  icon,
  label,
  containerRef: _containerRef,
  actionStyles,
}: AddQuickActionProps) {
  const {ds} = useTheme();

  const [_activeTemplate, setActiveTemplate] = useState<TemplateKey>('item');

  const handleSelect = useCallback((actionId: string) => {
    setActiveTemplate(actionId as TemplateKey);
  }, []);

  const menuActions: SykaMenuAction[] = useMemo(
    () =>
      TEMPLATE_OPTIONS.map(({label, key}) => ({
        id: key,
        title: label,
      })),
    [],
  );

  const trigger = (
    <TouchableOpacity
      accessibilityHint="Opens quick add options"
      accessibilityRole="button"
      activeOpacity={0.7}
      style={actionStyles.actionButton}
    >
      <View style={actionStyles.iconContainer}>
        <Icon name={icon} size={ds.iconSize.xxl} colorToken="quickActionIcon" />
      </View>
      <ThemedText variant="subheadline" style={actionStyles.actionLabel}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <SykaMenuView
      actions={menuActions}
      onPressAction={({nativeEvent}) => handleSelect(nativeEvent.event)}
    >
      {trigger}
    </SykaMenuView>
  );
}

type QuickActionStyleBundle = {
  actionButton: StyleProp<ViewStyle>;
  iconContainer: StyleProp<ViewStyle>;
  actionLabel: StyleProp<TextStyle>;
};

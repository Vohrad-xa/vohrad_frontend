import React, {useCallback, useMemo, useState} from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {SykaMenuView, type SykaMenuAction} from 'syka-menu';
import {PaperMenu, ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

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
  icon: string;
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
  const {ds, theme} = useTheme();
  const componentStyles = useMemo(() => createStyles(ds, theme), [ds, theme]);

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
      <ThemedText style={actionStyles.actionLabel}>{label}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <View style={componentStyles.wrapper}>
      {Platform.OS === 'web' ? (
        <PaperMenu actions={menuActions} onSelect={handleSelect}>
          {trigger}
        </PaperMenu>
      ) : (
        <SykaMenuView
          actions={menuActions}
          onPressAction={({nativeEvent}) => handleSelect(nativeEvent.event)}
        >
          {trigger}
        </SykaMenuView>
      )}
    </View>
  );
}

type QuickActionStyleBundle = {
  actionButton: StyleProp<ViewStyle>;
  iconContainer: StyleProp<ViewStyle>;
  actionLabel: StyleProp<TextStyle>;
};

const createStyles = makeStyleFactory(
  (_ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

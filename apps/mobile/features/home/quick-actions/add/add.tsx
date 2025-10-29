import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {ContextMenu, type ContextMenuItem, ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon, type IconName} from '@/utils';
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
  icon: IconName;
  label: string;
  containerRef?: React.RefObject<View | null>;
  actionStyles: QuickActionStyleBundle;
};

export function AddQuickAction({
  icon,
  label,
  containerRef,
  actionStyles,
}: AddQuickActionProps) {
  const {ds, theme} = useTheme();
  const componentStyles = useMemo(() => createStyles(ds, theme), [ds, theme]);

  const anchorRef = useRef<View>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>('item');

  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const menuItems: ContextMenuItem[] = useMemo(
    () =>
      TEMPLATE_OPTIONS.map(({label, key}) => ({
        label,
        isActive: activeTemplate === key,
        onPress: () => setActiveTemplate(key),
      })),
    [activeTemplate],
  );

  return (
    <View ref={anchorRef} collapsable={false} style={componentStyles.wrapper}>
      <TouchableOpacity
        accessibilityHint="Opens quick add options"
        accessibilityRole="button"
        activeOpacity={0.7}
        onPress={openMenu}
        style={actionStyles.actionButton}
      >
        <View style={actionStyles.iconContainer}>
          <Icon
            name={icon}
            size={ds.iconSize.xxl}
            colorToken="quickActionIcon"
          />
        </View>
        <ThemedText style={actionStyles.actionLabel}>{label}</ThemedText>
      </TouchableOpacity>

      <ContextMenu
        items={menuItems}
        isOpen={isMenuOpen}
        onClose={closeMenu}
        anchorRef={anchorRef}
        containerRef={containerRef}
        variant="compact"
      />
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

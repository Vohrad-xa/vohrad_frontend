import React from 'react';
import {Platform} from 'react-native';
import {InfoRowCard, ThemedText, Toggle} from '@/components/ui';
import type {InfoField} from '@/components/ui';
import {type TokenName} from '@/constants/colors';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import {useDashboardCardControls} from './filter-context';

export function FilterContent() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  const {visibility, setCardVisibility, cardConfig} =
    useDashboardCardControls();

  const fields: InfoField[] = cardConfig.map((card) => {
    const visibilityKey = card.key;
    const isVisible = visibility[visibilityKey];

    return {
      key: visibilityKey,
      label: card.title,
      value: isVisible ? 'Shown' : 'Hidden',
      type: 'text' as const,
      span: 'full' as const,
      icon: card.icon,
      iconSize: 20,
      iconColorToken: card.colorToken as TokenName,
      renderAccessory: (
        <Toggle
          value={isVisible}
          onValueChange={(value) => setCardVisibility(visibilityKey, value)}
          accessibilityLabel={`Toggle ${card.title} card`}
        />
      ),
    };
  });

  return (
    <>
      <ThemedText variant="heading" style={styles.title}>
        Overview Cards
      </ThemedText>
      <ThemedText variant="caption" style={styles.description}>
        You can choose your preferred overview cards to be displayed on the home
      </ThemedText>
      <InfoRowCard fields={fields} editable={false} values={{}} />
    </>
  );
}

export default FilterContent;

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) => ({
    title: {
      marginBottom: ds.spacing.md,
      paddingHorizontal: Platform.OS === 'web' ? 0 : ds.spacing.xl,
    },
    description: {
      marginBottom: ds.spacing.lg,
      color: theme.muted,
      paddingHorizontal: Platform.OS === 'web' ? 0 : ds.spacing.xl,
    },
  }),
  (ds, theme) => themeKey(theme, ds),
);

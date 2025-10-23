import {StyleSheet, View} from 'react-native';
import {type DSShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon, type IconName} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';
import {ThemedText} from './themed-text';

type EmptyStateProps = {
  message: string;
  icon?: IconName;
  iconSize?: number;
};

export function EmptyState({message, icon, iconSize = 48}: EmptyStateProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <View style={styles.container}>
      {icon && (
        <Icon
          name={icon}
          size={iconSize}
          colorToken="muted"
          style={styles.icon}
        />
      )}
      <ThemedText variant="secondary" style={styles.message}>
        {message}
      </ThemedText>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape) =>
    StyleSheet.create({
      container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: ds.spacing.xxxl,
        gap: ds.spacing.md,
      },
      icon: {
        opacity: ds.opacity.muted,
      },
      message: {
        textAlign: 'center',
        opacity: ds.opacity.muted,
      },
    }),
  (ds) => ds.version,
);

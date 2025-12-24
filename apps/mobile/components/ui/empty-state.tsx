import {StyleSheet, View, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {type DSShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';
import {ThemedText} from './themed-text';

type EmptyStateProps = {
  message: string;
  icon?: string;
  iconSize?: number;
};

export function EmptyState({message, icon, iconSize = 48}: EmptyStateProps) {
  const {ds} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(ds);

  return (
    <View
      style={[
        styles.outerContainer,
        Platform.OS === 'ios' && {marginTop: -insets.top * 2},
      ]}
    >
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
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape) =>
    StyleSheet.create({
      outerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
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
  (ds) => ds.version.toString(),
);

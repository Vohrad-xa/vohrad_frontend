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

export function EmptyState({message, icon, iconSize = 55}: EmptyStateProps) {
  const {ds} = useTheme();
  const styles = createStyles(ds);

  return (
    <View style={styles.outerContainer}>
      {icon && (
        <Icon
          name={icon}
          size={iconSize}
          symbolType="palette"
          symbolColorTokens={['accentOrange', 'tertiary']}
          scale="medium"
          resizeMode="scaleAspectFill"
          fontWeight="ultraLight"
          animationSpec={{
            effect: {
              type: 'scale',
              direction: 'up',
            },
            repeating: false,
            speed: 0.6,
          }}
        />
      )}
      <ThemedText variant="footnote" fontWeight="regular" colorToken="muted">
        {message}
      </ThemedText>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape) =>
    StyleSheet.create({
      outerContainer: {
        flex: 1,
        minHeight: ds.screen.height / 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        gap: ds.spacing.md,
      },
    }),
  (ds) => ds.version.toString(),
);

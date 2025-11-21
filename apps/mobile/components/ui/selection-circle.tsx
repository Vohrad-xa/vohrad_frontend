import React from 'react';
import {StyleSheet, View, Platform} from 'react-native';
import {SymbolView} from 'expo-symbols';
import type {DSShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon, type SFSymbolName} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

interface SelectionCircleProps {
  selected: boolean;
}

export function SelectionCircle({selected}: SelectionCircleProps) {
  const {theme, ds} = useTheme();
  const styles = createStyles(ds);

  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={(selected ? 'checkmark.circle.fill' : 'circle') as SFSymbolName}
        size={25}
        tintColor={selected ? theme.secondary : theme.muted}
      />
    );
  }

  return (
    <View
      style={[
        styles.circle,
        selected && styles.circleSelected,
        {borderColor: theme.muted},
      ]}
    >
      {selected && (
        <Icon
          name="checkmark-circle-outline"
          size={30}
          colorToken="secondary"
          style={styles.icon}
        />
      )}
    </View>
  );
}

const createStyles = makeStyleFactory(
  (_ds: DSShape) =>
    StyleSheet.create({
      circle: {
        width: 25,
        height: 25,
        borderRadius: 12.5,
        borderWidth: 0.5,
      },
      circleSelected: {
        borderWidth: 0,
      },
      icon: {
        marginTop: -2.5,
        marginLeft: -2.5,
      },
    }),
  (_ds) => _ds.version.toString(),
);

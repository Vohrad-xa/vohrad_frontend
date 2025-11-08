import React from 'react';
import {View} from 'react-native';
import {ThemedText} from '@/components/ui';
import {Toggle} from '@/components/ui/toggle';
import {useTheme} from '@/providers';

interface ActiveFieldProps {
  isActive?: boolean;
  onValueChange?: (value: boolean) => void;
}

const ActiveFieldComponent = ({isActive, onValueChange}: ActiveFieldProps) => {
  const {ds: _ds} = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <ThemedText variant="label" style={{flex: 1}}>
        active
      </ThemedText>
      <Toggle
        value={isActive ?? false}
        onValueChange={onValueChange ?? (() => {})}
        accessibilityLabel="Toggle item active status"
      />
    </View>
  );
};

ActiveFieldComponent.displayName = 'ActiveField';

export const ActiveField = React.memo(ActiveFieldComponent);

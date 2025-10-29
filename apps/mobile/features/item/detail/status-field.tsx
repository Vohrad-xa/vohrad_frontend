import React from 'react';
import {View} from 'react-native';
import {ThemedText} from '@/components/ui';
import {Toggle} from '@/components/ui/toggle';
import {useTheme} from '@/providers';

interface StatusFieldProps {
  isActive?: boolean;
  onValueChange?: (value: boolean) => void;
}

const StatusFieldComponent = ({isActive, onValueChange}: StatusFieldProps) => {
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
        Status
      </ThemedText>
      <Toggle
        value={isActive ?? false}
        onValueChange={onValueChange ?? (() => {})}
        accessibilityLabel="Toggle item active status"
      />
    </View>
  );
};

StatusFieldComponent.displayName = 'StatusField';

export const StatusField = React.memo(StatusFieldComponent);

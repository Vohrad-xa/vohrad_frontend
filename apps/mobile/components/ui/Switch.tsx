import React, { useState } from 'react';
import { Switch as RNSwitch, SwitchProps } from 'react-native';

interface CustomSwitchProps extends Partial<SwitchProps> {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
}

export default function Switch({ value, onValueChange, ...props }: CustomSwitchProps) {
  const [internalValue, setInternalValue] = useState(false);

  const switchValue = value !== undefined ? value : internalValue;
  const handleChange = onValueChange || setInternalValue;

  return (
    <RNSwitch
      value={switchValue}
      onValueChange={handleChange}
      trackColor={{ false: '#767577', true: '#f5cd07ff' }}
      thumbColor={switchValue ? '#ffffff' : '#f4f3f4'}
      {...props}
    />
  );
}

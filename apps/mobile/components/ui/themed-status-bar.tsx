import {Platform} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {useTheme} from '@/providers';

export function ThemedStatusBar() {
  const {scheme} = useTheme();

  return (
    <StatusBar
      style={
        Platform.OS === 'android'
          ? scheme === 'dark'
            ? 'light'
            : 'dark'
          : 'auto'
      }
    />
  );
}

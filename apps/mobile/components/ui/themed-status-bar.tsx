import {StatusBar} from 'expo-status-bar';
import {useTheme} from '@/providers';

export function ThemedStatusBar() {
  const {scheme} = useTheme();

  return (
    <StatusBar
      style={scheme === 'dark' ? 'light' : 'dark'}
      animated={true}
      hideTransitionAnimation="slide"
    />
  );
}

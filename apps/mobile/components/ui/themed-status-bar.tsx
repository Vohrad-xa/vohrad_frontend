import {StatusBar} from 'expo-status-bar';
import {useTheme} from '@/providers';

export function ThemedStatusBar() {
  const {scheme} = useTheme();

  return <StatusBar key={scheme} style={scheme === 'dark' ? 'auto' : 'dark'} />;
}

import {StyleSheet} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';

type NavigationGradientProps = {
  scheme: 'light' | 'dark';
};

export function NavigationGradient({scheme}: NavigationGradientProps) {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={
        scheme === 'light'
          ? [
              'hsla(0, 5%, 92%, 0.53)',
              'hsla(0, 3%, 92%, 0.69)',
              'hsla(0, 2%, 89%, 0.79)',
            ]
          : [
              'hsla(0, 1%, 17%, 0.47)',
              'hsla(240, 5%, 22%, 0.28)',
              'hsla(0, 4%, 11%, 0.67)',
            ]
      }
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={StyleSheet.absoluteFill}
    />
  );
}

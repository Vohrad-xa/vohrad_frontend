import { View, Text } from 'react-native';
import { useTypography } from '@/hooks/use-typography';

export default function ScanPage() {
  const typography = useTypography();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={typography.style('headline')}>Scan</Text>
    </View>
  );
}

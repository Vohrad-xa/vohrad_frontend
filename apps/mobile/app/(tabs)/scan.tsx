import { View } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';

export default function ScanPage() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText variant="headline">Scan</ThemedText>
    </View>
  );
}

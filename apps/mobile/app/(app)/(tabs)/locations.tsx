import {RefreshableScrollView, ThemedText, ThemedView} from '@/components/ui';
import {useTheme} from '@/providers';
import {STANDARD_TAB_CONTAINER, STANDARD_CONTENT_SPACING} from '@/types/ui';

export default function LocationsPage() {
  const {theme} = useTheme();

  return (
    <RefreshableScrollView
      bounces
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      style={{backgroundColor: theme.background}}
    >
      <ThemedView style={STANDARD_TAB_CONTAINER}>
        <ThemedText variant="largeTitle">Locations</ThemedText>
        <ThemedText variant="body" style={STANDARD_CONTENT_SPACING}>
          Manage storage locations, rooms, and assigned areas here.
        </ThemedText>
      </ThemedView>
    </RefreshableScrollView>
  );
}

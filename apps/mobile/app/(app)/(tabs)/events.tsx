import {RefreshableScrollView, ThemedText, ThemedView} from '@/components/ui';
import {useTheme} from '@/providers';
import {STANDARD_TAB_CONTAINER, STANDARD_CONTENT_SPACING} from '@/types/ui';

export default function EventsPage() {
  const {theme} = useTheme();

  return (
    <RefreshableScrollView
      bounces
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      style={{backgroundColor: theme.background}}
    >
      <ThemedView style={STANDARD_TAB_CONTAINER}>
        <ThemedText variant="pageTitle">Events</ThemedText>
        <ThemedText variant="body" style={STANDARD_CONTENT_SPACING}>
          System events and notifications will be displayed here.
        </ThemedText>
      </ThemedView>
    </RefreshableScrollView>
  );
}

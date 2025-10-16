import {RefreshableScrollView, ThemedText, ThemedView} from '@/components/ui';
import {useTheme} from '@/providers';

export default function EventsPage() {
  const {theme, ds} = useTheme();

  return (
    <RefreshableScrollView
      bounces
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      style={{backgroundColor: theme.background}}
    >
      <ThemedView style={{flex: 1, padding: ds.spacing.lg}}>
        <ThemedText variant="pageTitle">Events</ThemedText>
        <ThemedText variant="body" style={{marginTop: ds.spacing.lg}}>
          System events and notifications will be displayed here.
        </ThemedText>
      </ThemedView>
    </RefreshableScrollView>
  );
}

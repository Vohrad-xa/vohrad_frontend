import {RefreshableScrollView, ThemedText, ThemedView} from '@/components/ui';
import {useTheme} from '@/providers';

export default function LocationsPage() {
  const {theme, ds} = useTheme();

  return (
    <RefreshableScrollView
      bounces
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      style={{backgroundColor: theme.background}}
    >
      <ThemedView style={{flex: 1, padding: ds.spacing.lg}}>
        <ThemedText variant="pageTitle">Locations</ThemedText>
        <ThemedText variant="body" style={{marginTop: ds.spacing.lg}}>
          Manage storage locations, rooms, and assigned areas here.
        </ThemedText>
      </ThemedView>
    </RefreshableScrollView>
  );
}

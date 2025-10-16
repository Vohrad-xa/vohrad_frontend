import {RefreshableScrollView, ThemedText, ThemedView} from '@/components/ui';
import {useTheme} from '@/providers';

export default function ItemsPage() {
  const {theme, ds} = useTheme();

  return (
    <RefreshableScrollView
      bounces
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      style={{backgroundColor: theme.background}}
    >
      <ThemedView style={{flex: 1, padding: ds.spacing.lg}}>
        <ThemedText variant="pageTitle">Items</ThemedText>
        <ThemedText variant="body" style={{marginTop: ds.spacing.lg}}>
          Inventory items will be displayed here.
        </ThemedText>
      </ThemedView>
    </RefreshableScrollView>
  );
}

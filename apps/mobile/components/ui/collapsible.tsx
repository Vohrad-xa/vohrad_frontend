import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import Icon from '@/utils/icons';
import { useTheme } from '@/providers/theme-provider';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { ds } = useTheme();

  const styles = StyleSheet.create({
    heading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ds.spacing.xs,
    },
    content: {
      marginTop: ds.spacing.xs,
      marginLeft: ds.spacing.lg + ds.spacing.sm,
    },
  });

  return (
    <ThemedView>
      <TouchableOpacity style={styles.heading} onPress={() => setIsOpen((value) => !value)} activeOpacity={0.8}>
        <Icon
          name="chevron-forward-outline"
          size="sm"
          colorToken="icon"
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <ThemedText variant="headline">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

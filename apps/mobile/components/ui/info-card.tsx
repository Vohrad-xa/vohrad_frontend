import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GlassCard } from '@/components/ui/glass-card';
import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/providers/theme-provider';

interface StatItemProps {
  value: string;
  label: string;
}

function StatItem({ value, label }: StatItemProps) {
  const { ds } = useTheme();

  const statStyles = StyleSheet.create({
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontWeight: ds.fontWeight.semibold,
    },
    statLabel: {
      marginTop: ds.spacing.xs,
      opacity: 0.7,
    },
  });

  return (
    <View style={statStyles.statItem}>
      <ThemedText variant="title2" style={statStyles.statValue}>
        {value}
      </ThemedText>
      <ThemedText variant="caption1" style={statStyles.statLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

export function InfoCard() {
  const { ds } = useTheme();

  const styles = StyleSheet.create({
    card: {
      height: 100,
    },
    cardContentOverride: {
      alignItems: 'stretch',
      padding: ds.spacing.lg,
    },
    content: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontWeight: ds.fontWeight.semibold,
    },
    statLabel: {
      marginTop: ds.spacing.xs,
      opacity: 0.7,
    },
  });

  return (
    <GlassCard style={styles.card} contentStyle={styles.cardContentOverride}>
      <View style={styles.content}>
        <StatItem value="2,847" label="Items" />
        <StatItem value="95%" label="Active" />
        <StatItem value="12" label="Locations" />
      </View>
    </GlassCard>
  );
}

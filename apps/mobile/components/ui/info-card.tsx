import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from '@/components/ui/glass-card';
import { DesignSystem } from '@/constants/typography';
import { useTypography } from '@/hooks/use-typography';

interface StatItemProps {
  value: string;
  label: string;
}

function StatItem({ value, label }: StatItemProps) {
  const typography = useTypography();

  return (
    <View style={styles.statItem}>
      <Text style={[typography.style('title2'), styles.statValue]}>{value}</Text>
      <Text style={[typography.style('caption1'), styles.statLabel]}>{label}</Text>
    </View>
  );
}

export function InfoCard() {
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

const styles = StyleSheet.create({
  card: {
    height: 100,
  },
  cardContentOverride: {
    alignItems: 'stretch',
    padding: DesignSystem.spacing.lg,
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
    fontWeight: DesignSystem.fontWeight.semibold,
  },
  statLabel: {
    marginTop: DesignSystem.spacing.xs,
    opacity: 0.7,
  },
});

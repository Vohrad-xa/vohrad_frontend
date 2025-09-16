import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from '@/components/ui/glass-card';
import { DesignSystem } from '@/constants/typography';
import { useTypography } from '@/hooks/use-typography';
import { Icon, type IconName } from '@/utils/icons';

interface StatItemProps {
  icon: IconName;
  value: string;
  label: string;
  iconColor?: string;
}

function StatItem({ icon, value, label, iconColor = '#1b801cff' }: StatItemProps) {
  const typography = useTypography();

  return (
    <View style={styles.statItem}>
      <Icon name={icon} size="lg" color={iconColor} />
      <Text style={[typography.style('title2'), styles.statValue]}>{value}</Text>
      <Text style={[typography.style('caption1'), styles.statLabel]}>{label}</Text>
    </View>
  );
}

export function InfoCard() {
  return (
    <GlassCard style={styles.card} contentStyle={styles.cardContent}>
      <View style={styles.content}>
        <StatItem icon="cube-outline" value="2,847" label="Items" />
        <StatItem icon="checkmark-circle-outline" value="95%" label="Active" />
        <StatItem icon="location-outline" value="12" label="Locations" />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: DesignSystem.spacing.xs,
  },
  cardContent: {
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
    marginTop: DesignSystem.spacing.xs,
    fontWeight: '600',
  },
  statLabel: {
    marginTop: DesignSystem.spacing.xs / 2,
    opacity: 0.7,
  },
});

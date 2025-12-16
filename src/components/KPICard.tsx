// KPI Card component for dashboard statistics

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { colors } from '../theme';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  trend?: number;
  subtitle?: string;
}

export function KPICard({ title, value, icon, color = colors.primary, trend, subtitle }: KPICardProps) {
  const theme = useTheme();

  return (
    <Card style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
            {icon}
          </View>
          {trend !== undefined && (
            <View style={[styles.trendBadge, { backgroundColor: trend >= 0 ? colors.error : colors.success }]}>
              <Text style={styles.trendText}>
                {trend >= 0 ? '+' : ''}{trend}%
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.value, { color }]} numberOfLines={1}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 4,
    borderRadius: 8,
    elevation: 2,
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  trendText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    color: colors.grey600,
  },
  subtitle: {
    fontSize: 10,
    color: colors.grey500,
    marginTop: 2,
  },
});

export default KPICard;

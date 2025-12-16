// Defect Trends Bar Chart component for Mobile
// Shows defect count vs target over time

import React from 'react';
import { View, StyleSheet, Dimensions, Text as RNText } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';
import { DefectTrend } from '../types';
import { colors } from '../theme';

interface DefectTrendsChartProps {
  data: DefectTrend[];
  title?: string;
}

const screenWidth = Dimensions.get('window').width;

export function DefectTrendsChart({ data, title = '不良件数推移' }: DefectTrendsChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>データがありません</Text>
          </View>
        </Card.Content>
      </Card>
    );
  }

  // Prepare data for react-native-chart-kit
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        data: data.map((d) => d.defects),
      },
    ],
  };

  // Determine bar colors based on defects vs target
  const getBarColor = (defects: number, target: number) => {
    if (defects > target * 1.5) return 'rgba(244, 67, 54, 0.8)'; // Critical (red)
    if (defects > target) return 'rgba(255, 152, 0, 0.8)'; // Warning (orange)
    return 'rgba(76, 175, 80, 0.8)'; // Good (green)
  };

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    barPercentage: 0.6,
    propsForBackgroundLines: {
      strokeDasharray: '3 3',
      stroke: colors.grey300,
    },
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>過去7日間の推移</Text>
        <View style={styles.chartContainer}>
          <BarChart
            data={chartData}
            width={screenWidth - 64}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
            showValuesOnTopOfBars
            withInnerLines
            yAxisLabel=""
            yAxisSuffix="件"
          />
        </View>
        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4caf50' }]} />
            <RNText style={styles.legendText}>目標以下</RNText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ff9800' }]} />
            <RNText style={styles.legendText}>目標超過</RNText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f44336' }]} />
            <RNText style={styles.legendText}>要注意</RNText>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: 'center',
    marginHorizontal: -16,
  },
  chart: {
    borderRadius: 8,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});

export default DefectTrendsChart;

// Machine Status Bar Chart component for Mobile
// Shows defect rate by machine with status-based colors

import React from 'react';
import { View, StyleSheet, Dimensions, Text as RNText } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';
import { MachineStatus } from '../types';
import { colors } from '../theme';

interface MachineStatusChartProps {
  data: MachineStatus[];
  title?: string;
}

const screenWidth = Dimensions.get('window').width;

const STATUS_COLORS = {
  good: '#4caf50',
  warning: '#ff9800',
  critical: '#f44336',
};

export function MachineStatusChart({ data, title = '機械別不良率' }: MachineStatusChartProps) {
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
    labels: data.map((d) => d.name.substring(0, 8)), // Truncate long names
    datasets: [
      {
        data: data.map((d) => d.defectRate),
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1, index?: number) => {
      // Use status-based colors
      if (index !== undefined && data[index]) {
        const status = data[index].status;
        const statusColor = STATUS_COLORS[status];
        return statusColor;
      }
      return `rgba(33, 150, 243, ${opacity})`;
    },
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
        <Text style={styles.subtitle}>各機械の不良率 (%)</Text>
        <View style={styles.chartContainer}>
          <BarChart
            data={chartData}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
            showValuesOnTopOfBars
            withInnerLines
            yAxisLabel=""
            yAxisSuffix="%"
          />
        </View>
        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.good }]} />
            <RNText style={styles.legendText}>良好</RNText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.warning }]} />
            <RNText style={styles.legendText}>警告</RNText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.critical }]} />
            <RNText style={styles.legendText}>危険</RNText>
          </View>
        </View>
        {/* Machine Status List */}
        <View style={styles.statusList}>
          {data.map((machine) => (
            <View key={machine.name} style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: STATUS_COLORS[machine.status] }]} />
              <RNText style={styles.machineName}>{machine.name}</RNText>
              <RNText style={styles.machineStats}>{machine.defectRate}% ({machine.incidents}件)</RNText>
            </View>
          ))}
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
  statusList: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey200,
    paddingTop: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  machineName: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  machineStats: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default MachineStatusChart;

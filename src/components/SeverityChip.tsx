// Severity Chip component for displaying defect severity

import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { severityColors } from '../theme';

interface SeverityChipProps {
  severity: 'low' | 'medium' | 'high' | 'critical' | string;
  size?: 'small' | 'medium';
}

const severityLabels: Record<string, string> = {
  critical: '重大',
  high: '高',
  medium: '中',
  low: '低',
};

export function SeverityChip({ severity, size = 'small' }: SeverityChipProps) {
  const normalizedSeverity = severity.toLowerCase();
  const color = severityColors[normalizedSeverity as keyof typeof severityColors] || severityColors.medium;
  const label = severityLabels[normalizedSeverity] || severity;

  return (
    <Chip
      style={[
        styles.chip,
        { backgroundColor: color },
        size === 'small' && styles.smallChip,
      ]}
      textStyle={[
        styles.text,
        size === 'small' && styles.smallText,
      ]}
    >
      {label}
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 12,
  },
  smallChip: {
    height: 24,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  smallText: {
    fontSize: 10,
  },
});

export default SeverityChip;

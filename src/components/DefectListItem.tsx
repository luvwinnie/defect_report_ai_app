// Defect List Item component for displaying defect reports

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { DefectReport } from '../types';
import { SeverityChip } from './SeverityChip';
import { colors } from '../theme';

interface DefectListItemProps {
  defect: DefectReport;
  onPress?: (defect: DefectReport) => void;
}

export function DefectListItem({ defect, onPress }: DefectListItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity onPress={() => onPress?.(defect)} activeOpacity={0.7}>
      <Surface style={styles.container} elevation={1}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.reportId}>{defect.report_id}</Text>
              {defect.machine_name && (
                <Text style={styles.machineName}>{defect.machine_name}</Text>
              )}
            </View>
            <SeverityChip severity={defect.severity} size="small" />
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {defect.defect_description}
          </Text>

          <View style={styles.footer}>
            {defect.operator_name && (
              <Text style={styles.operator}>
                担当: {defect.operator_name}
              </Text>
            )}
            <Text style={styles.date}>{formatDate(defect.created_at)}</Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  reportId: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  machineName: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  operator: {
    fontSize: 11,
    color: colors.grey500,
  },
  date: {
    fontSize: 11,
    color: colors.grey500,
  },
});

export default DefectListItem;

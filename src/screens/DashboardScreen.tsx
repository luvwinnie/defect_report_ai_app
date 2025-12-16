// Dashboard Screen showing KPI summary, charts, and recent defects
// Matches web dashboard features for manufacturing data visualization

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Text, Divider, ActivityIndicator, Card } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { KPICard, DefectListItem, DefectTrendsChart, MachineStatusChart } from '../components';
import { DashboardStats, DefectReport, KPIData, ExecutiveSummary, DefectTrend, MachineStatus } from '../types';
import api from '../services/api';
import { colors } from '../theme';

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary | null>(null);
  const [defectTrends, setDefectTrends] = useState<DefectTrend[]>([]);
  const [machineStatus, setMachineStatus] = useState<MachineStatus[]>([]);
  const [recentDefects, setRecentDefects] = useState<DefectReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [statsData, defectsData, kpisData, summaryData, trendsData, machinesData] = await Promise.all([
        api.getDashboardStats(),
        api.getRecentDefects(5),
        api.getManufacturingKPIs(),
        api.getExecutiveSummary(),
        api.getDefectTrends(7),
        api.getMachineStatus(),
      ]);
      setStats(statsData);
      setRecentDefects(defectsData);
      setKpis(kpisData);
      setExecutiveSummary(summaryData);
      setDefectTrends(trendsData);
      setMachineStatus(machinesData);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError('データの取得に失敗しました');
      // Set mock data for demo
      setStats({
        total_defects: 156,
        critical_defects: 12,
        defects_this_month: 23,
        trend_percentage: -5.2,
        machines_affected: 8,
      });
      setKpis({
        totalDefects: 156,
        totalMachines: 12,
        totalOperators: 8,
        totalCustomers: 5,
        avgDefectRate: 0.023,
        criticalMachines: 3,
        criticalDefects: 12,
      });
      setExecutiveSummary({
        topRootCauses: [
          { cause: '工具摩耗', count: 45 },
          { cause: '材料不良', count: 32 },
          { cause: '設定ミス', count: 28 },
        ],
        defectTypes: [
          { type: '寸法不良', count: 52 },
          { type: '表面傷', count: 38 },
          { type: '形状不良', count: 29 },
        ],
        severityDistribution: [
          { severity: 'High', count: 24 },
          { severity: 'Medium', count: 67 },
          { severity: 'Low', count: 65 },
        ],
        lastUpdated: new Date().toISOString(),
      });
      setDefectTrends([
        { date: '12/10', defects: 8, target: 10 },
        { date: '12/11', defects: 12, target: 10 },
        { date: '12/12', defects: 6, target: 10 },
        { date: '12/13', defects: 15, target: 10 },
        { date: '12/14', defects: 9, target: 10 },
        { date: '12/15', defects: 11, target: 10 },
        { date: '12/16', defects: 7, target: 10 },
      ]);
      setMachineStatus([
        { name: 'CMX800', defectRate: 1.2, incidents: 8, status: 'good' },
        { name: 'DMG NLX', defectRate: 3.5, incidents: 15, status: 'warning' },
        { name: 'Mazak QT', defectRate: 5.8, incidents: 22, status: 'critical' },
        { name: 'Okuma LB', defectRate: 2.1, incidents: 12, status: 'good' },
        { name: 'Haas VF2', defectRate: 4.2, incidents: 18, status: 'warning' },
      ]);
      setRecentDefects([
        {
          id: '1',
          report_id: 'DR-2024-001',
          status: 'open',
          machine_name: 'CMX800',
          defect_description: '位置度公差を超過した不良が発生。',
          severity: 'high',
          created_at: new Date().toISOString(),
          operator_name: '山田太郎',
        },
        {
          id: '2',
          report_id: 'DR-2024-002',
          status: 'in_progress',
          machine_name: 'DMG MORI NLX 2500',
          defect_description: '加工中にワークが折れる不良が発生。',
          severity: 'critical',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          operator_name: '佐藤花子',
        },
      ]);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const handleDefectPress = (defect: DefectReport) => {
    console.log('Defect pressed:', defect.id);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>データを読み込み中...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
        />
      }
    >
      {/* Last Updated */}
      {lastUpdated && (
        <View style={styles.lastUpdatedContainer}>
          <Text style={styles.lastUpdatedText}>
            最終更新: {lastUpdated.toLocaleTimeString('ja-JP')}
          </Text>
        </View>
      )}

      {/* KPI Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>製造 KPI サマリー</Text>
        <View style={styles.kpiRow}>
          <KPICard
            title="総不良件数"
            value={kpis?.totalDefects || stats?.total_defects || 0}
            icon={
              <MaterialCommunityIcons
                name="alert-circle"
                size={20}
                color={colors.primary}
              />
            }
            color={colors.primary}
            trend={stats?.trend_percentage}
          />
          <KPICard
            title="重大な不良"
            value={kpis?.criticalDefects || stats?.critical_defects || 0}
            icon={
              <MaterialCommunityIcons
                name="alert-octagon"
                size={20}
                color={colors.error}
              />
            }
            color={colors.error}
          />
        </View>
        <View style={styles.kpiRow}>
          <KPICard
            title="総機械数"
            value={kpis?.totalMachines || 0}
            icon={
              <MaterialCommunityIcons
                name="cog"
                size={20}
                color={colors.info}
              />
            }
            color={colors.info}
          />
          <KPICard
            title="要注意機械"
            value={kpis?.criticalMachines || 0}
            icon={
              <MaterialCommunityIcons
                name="alert"
                size={20}
                color={colors.warning}
              />
            }
            color={colors.warning}
          />
        </View>
        <View style={styles.kpiRow}>
          <KPICard
            title="オペレータ数"
            value={kpis?.totalOperators || 0}
            icon={
              <MaterialCommunityIcons
                name="account-group"
                size={20}
                color={colors.success}
              />
            }
            color={colors.success}
          />
          <KPICard
            title="平均不良率"
            value={`${((kpis?.avgDefectRate || 0) * 100).toFixed(1)}%`}
            icon={
              <MaterialCommunityIcons
                name="percent"
                size={20}
                color={colors.grey600}
              />
            }
            color={colors.grey600}
          />
        </View>
      </View>

      <Divider style={styles.divider} />

      {/* Defect Trends Chart */}
      <View style={styles.section}>
        <DefectTrendsChart data={defectTrends} title="不良件数推移" />
      </View>

      {/* Machine Status Chart */}
      <View style={styles.section}>
        <MachineStatusChart data={machineStatus} title="機械別不良率" />
      </View>

      <Divider style={styles.divider} />

      {/* Executive Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>エグゼクティブサマリー</Text>

        {/* Top Root Causes */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>主な根本原因 TOP 3</Text>
            {executiveSummary?.topRootCauses.slice(0, 3).map((item, index) => (
              <View key={item.cause} style={styles.summaryRow}>
                <View style={styles.summaryRank}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <Text style={styles.summaryLabel}>{item.cause}</Text>
                <Text style={styles.summaryValue}>{item.count}件</Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Defect Types */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>不良タイプ分布</Text>
            {executiveSummary?.defectTypes.slice(0, 3).map((item, index) => (
              <View key={item.type} style={styles.summaryRow}>
                <View style={[styles.summaryRank, { backgroundColor: colors.info }]}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <Text style={styles.summaryLabel}>{item.type}</Text>
                <Text style={styles.summaryValue}>{item.count}件</Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Severity Distribution */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>重要度分布</Text>
            {executiveSummary?.severityDistribution.map((item) => {
              const severityColors: Record<string, string> = {
                High: colors.error,
                Medium: colors.warning,
                Low: colors.success,
              };
              return (
                <View key={item.severity} style={styles.summaryRow}>
                  <View
                    style={[
                      styles.severityDot,
                      { backgroundColor: severityColors[item.severity] || colors.grey500 }
                    ]}
                  />
                  <Text style={styles.summaryLabel}>{item.severity}</Text>
                  <Text style={styles.summaryValue}>{item.count}件</Text>
                </View>
              );
            })}
          </Card.Content>
        </Card>
      </View>

      <Divider style={styles.divider} />

      {/* Recent Defects Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>最近の不良報告</Text>
        {recentDefects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="clipboard-check"
              size={48}
              color={colors.grey400}
            />
            <Text style={styles.emptyText}>不良報告はありません</Text>
          </View>
        ) : (
          <View style={styles.defectList}>
            {recentDefects.map((defect) => (
              <DefectListItem
                key={defect.id}
                defect={defect}
                onPress={handleDefectPress}
              />
            ))}
          </View>
        )}
      </View>

      {/* Bottom Padding */}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
  },
  lastUpdatedContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  lastUpdatedText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  kpiRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: colors.grey300,
  },
  defectList: {
    marginHorizontal: -16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 8,
    color: colors.grey500,
  },
  summaryCard: {
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey200,
  },
  summaryRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
});

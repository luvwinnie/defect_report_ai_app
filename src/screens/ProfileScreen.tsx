// Profile Screen showing user info and logout option

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  Chip,
  List,
  Divider,
  Button,
} from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme';

const roleLabels: Record<string, string> = {
  admin: '管理者',
  manager: '管理職',
  operator: '作業員',
  viewer: '閲覧者',
};

const roleColors: Record<string, string> = {
  admin: colors.error,
  manager: colors.warning,
  operator: colors.info,
  viewer: colors.success,
};

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const getInitials = (name?: string): string => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const roleColor = roleColors[user?.role || 'viewer'] || colors.info;

  return (
    <ScrollView style={styles.container}>
      {/* User Info Card */}
      <Surface style={styles.profileCard} elevation={2}>
        <View style={styles.avatarContainer}>
          <Avatar.Text
            size={80}
            label={getInitials(user?.full_name || user?.username)}
            style={[styles.avatar, { backgroundColor: colors.primary }]}
            labelStyle={styles.avatarLabel}
          />
          <Chip
            style={[styles.roleChip, { backgroundColor: roleColor }]}
            textStyle={styles.roleChipText}
          >
            {roleLabels[user?.role || 'viewer']}
          </Chip>
        </View>

        <Text style={styles.userName}>
          {user?.full_name || user?.username || 'ユーザー'}
        </Text>
        <Text style={styles.userHandle}>@{user?.username || '-'}</Text>

        {user?.email && (
          <View style={styles.emailContainer}>
            <MaterialCommunityIcons name="email-outline" size={16} color={colors.grey500} />
            <Text style={styles.emailText}>{user.email}</Text>
          </View>
        )}
      </Surface>

      {/* Account Info */}
      <Surface style={styles.section} elevation={1}>
        <Text style={styles.sectionTitle}>アカウント情報</Text>

        <List.Item
          title="ユーザー名"
          description={user?.username || '-'}
          left={(props) => <List.Icon {...props} icon="account" color={colors.primary} />}
        />
        <Divider />
        <List.Item
          title="役割"
          description={roleLabels[user?.role || 'viewer']}
          left={(props) => <List.Icon {...props} icon="shield-account" color={roleColor} />}
        />
        <Divider />
        <List.Item
          title="ステータス"
          description={user?.is_active ? 'アクティブ' : '無効'}
          left={(props) => (
            <List.Icon
              {...props}
              icon={user?.is_active ? 'check-circle' : 'close-circle'}
              color={user?.is_active ? colors.success : colors.error}
            />
          )}
        />
      </Surface>

      {/* Actions */}
      <Surface style={styles.section} elevation={1}>
        <Text style={styles.sectionTitle}>アクション</Text>

        <List.Item
          title="設定"
          description="アプリの設定を変更"
          left={(props) => <List.Icon {...props} icon="cog" color={colors.grey600} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {
            // TODO: Navigate to settings
            Alert.alert('設定', '設定画面は開発中です');
          }}
        />
        <Divider />
        <List.Item
          title="ヘルプ"
          description="よくある質問とサポート"
          left={(props) => <List.Icon {...props} icon="help-circle" color={colors.info} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {
            Alert.alert('ヘルプ', 'ヘルプ画面は開発中です');
          }}
        />
      </Surface>

      {/* App Info */}
      <Surface style={styles.section} elevation={1}>
        <Text style={styles.sectionTitle}>アプリ情報</Text>

        <List.Item
          title="バージョン"
          description="1.0.0"
          left={(props) => <List.Icon {...props} icon="information" color={colors.grey500} />}
        />
        <Divider />
        <List.Item
          title="ビルド"
          description="2024.12.001"
          left={(props) => <List.Icon {...props} icon="package-variant" color={colors.grey500} />}
        />
      </Surface>

      {/* Logout Button */}
      <Button
        mode="contained"
        onPress={handleLogout}
        loading={isLoading}
        disabled={isLoading}
        style={styles.logoutButton}
        contentStyle={styles.logoutButtonContent}
        icon="logout"
        buttonColor={colors.error}
      >
        ログアウト
      </Button>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  avatarLabel: {
    fontSize: 28,
    fontWeight: '600',
  },
  roleChip: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    height: 24,
  },
  roleChipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emailText: {
    fontSize: 13,
    color: colors.grey500,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
  bottomSpacer: {
    height: 32,
  },
});

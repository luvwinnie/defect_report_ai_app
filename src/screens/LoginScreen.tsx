// Login Screen for user authentication

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  Snackbar,
  HelperText,
} from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  const validateForm = (): boolean => {
    if (!username.trim()) {
      setError('ユーザー名を入力してください');
      setShowError(true);
      return false;
    }
    if (!password) {
      setError('パスワードを入力してください');
      setShowError(true);
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(username.trim(), password);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.detail ||
        err?.message ||
        'ログインに失敗しました。認証情報を確認してください。';
      setError(errorMessage);
      setShowError(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo and Title */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="factory"
              size={64}
              color={colors.primary}
            />
          </View>
          <Text style={styles.title}>不良分析</Text>
          <Text style={styles.subtitle}>製造不良管理システム</Text>
        </View>

        {/* Login Form */}
        <Surface style={styles.formContainer} elevation={2}>
          <Text style={styles.formTitle}>ログイン</Text>

          <TextInput
            label="ユーザー名"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="account" />}
            disabled={isLoading}
          />

          <TextInput
            label="パスワード"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            disabled={isLoading}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.loginButton}
            contentStyle={styles.loginButtonContent}
            labelStyle={styles.loginButtonLabel}
          >
            ログイン
          </Button>
        </Surface>

        {/* Demo Credentials Hint */}
        <View style={styles.hintContainer}>
          <Text style={styles.hintTitle}>デモ用アカウント:</Text>
          <Text style={styles.hintText}>ユーザー名: admin</Text>
          <Text style={styles.hintText}>パスワード: Admin@123!</Text>
        </View>
      </ScrollView>

      {/* Error Snackbar */}
      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={4000}
        action={{
          label: '閉じる',
          onPress: () => setShowError(false),
        }}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  formContainer: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  loginButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  hintContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: `${colors.info}15`,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  hintTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.info,
    marginBottom: 4,
  },
  hintText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  snackbar: {
    backgroundColor: colors.error,
  },
});

// Main App Navigator - switches between Auth and Main based on authentication state

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from '../components';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="認証を確認中..." />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default AppNavigator;

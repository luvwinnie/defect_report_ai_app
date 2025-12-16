// Main Tab Navigator for authenticated users

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import DashboardScreen from '../screens/DashboardScreen';
import DefectInputScreen from '../screens/DefectInputScreen';
import AIChatScreen from '../screens/AIChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors, sectionColors } from '../theme';

// Tab parameter types
export type MainTabParamList = {
  HomeTab: undefined;
  InputTab: undefined;
  ChatTab: undefined;
  ProfileTab: undefined;
};

// Stack parameter types for each tab
export type HomeStackParamList = {
  Dashboard: undefined;
  DefectDetail: { defectId: string };
};

export type InputStackParamList = {
  DefectInput: undefined;
};

export type ChatStackParamList = {
  AIChat: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const InputStack = createNativeStackNavigator<InputStackParamList>();
const ChatStack = createNativeStackNavigator<ChatStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// Home Stack
function HomeStackScreen() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <HomeStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'ダッシュボード' }}
      />
    </HomeStack.Navigator>
  );
}

// Input Stack
function InputStackScreen() {
  return (
    <InputStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: sectionColors.input },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <InputStack.Screen
        name="DefectInput"
        component={DefectInputScreen}
        options={{ title: '不適合報告入力' }}
      />
    </InputStack.Navigator>
  );
}

// Chat Stack
function ChatStackScreen() {
  return (
    <ChatStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <ChatStack.Screen
        name="AIChat"
        component={AIChatScreen}
        options={{ title: 'AI アシスタント' }}
      />
    </ChatStack.Navigator>
  );
}

// Profile Stack
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.grey700 },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'プロフィール' }}
      />
    </ProfileStack.Navigator>
  );
}

export function MainTabs() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.grey500,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: colors.grey200,
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'InputTab':
              iconName = focused ? 'file-document-edit' : 'file-document-edit-outline';
              break;
            case 'ChatTab':
              iconName = focused ? 'robot' : 'robot-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'account-circle' : 'account-circle-outline';
              break;
            default:
              iconName = 'help';
          }

          return <MaterialCommunityIcons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{ tabBarLabel: 'ホーム' }}
      />
      <Tab.Screen
        name="InputTab"
        component={InputStackScreen}
        options={{ tabBarLabel: '報告' }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatStackScreen}
        options={{ tabBarLabel: 'AI' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        options={{ tabBarLabel: 'プロフィール' }}
      />
    </Tab.Navigator>
  );
}

export default MainTabs;

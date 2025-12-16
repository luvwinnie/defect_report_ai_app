// AI Chat Screen for interacting with the AI assistant

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  IconButton,
  Text,
  Surface,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ChatMessage } from '../components';
import { ChatMessage as ChatMessageType } from '../types';
import api from '../services/api';
import { colors } from '../theme';

const SUGGESTED_QUERIES = [
  'CMX800の不良件数は？',
  '位置度公差を超えた不良の根本原因は？',
  'ワークが折れる不良の主な原因を分析して',
  '加工中に製品が動く不良の原因と対策は？',
  '重大な不良に共通する傾向は？',
];

export default function AIChatScreen() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await api.sendChatMessage(text.trim(), messages);

      const assistantMessage: ChatMessageType = {
        id: generateId(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        sources: response.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);

      const errorMessage: ChatMessageType = {
        id: generateId(),
        role: 'assistant',
        content: 'すみません、エラーが発生しました。もう一度お試しください。',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isLoading]);

  const handleNewChat = () => {
    setMessages([]);
    setInputText('');
  };

  const renderMessage = ({ item }: { item: ChatMessageType }) => (
    <ChatMessage message={item} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.robotContainer}>
        <MaterialCommunityIcons
          name="robot-happy"
          size={64}
          color={colors.primary}
        />
      </View>
      <Text style={styles.welcomeTitle}>AI アシスタント</Text>
      <Text style={styles.welcomeText}>
        製造不良に関する質問にお答えします。
        {'\n'}データに基づいた分析と提案を行います。
      </Text>

      <Text style={styles.suggestionsTitle}>質問の例：</Text>
      <View style={styles.suggestionsContainer}>
        {SUGGESTED_QUERIES.map((query, index) => (
          <Chip
            key={index}
            style={styles.suggestionChip}
            textStyle={styles.suggestionText}
            onPress={() => sendMessage(query)}
            icon={() => (
              <MaterialCommunityIcons
                name="lightbulb-outline"
                size={16}
                color={colors.primary}
              />
            )}
          >
            {query}
          </Chip>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header Actions */}
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={handleNewChat} style={styles.newChatButton}>
          <MaterialCommunityIcons name="plus" size={20} color={colors.primary} />
          <Text style={styles.newChatText}>新しいチャット</Text>
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.messagesList,
          messages.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmptyState}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false });
          }
        }}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>考え中...</Text>
        </View>
      )}

      {/* Input Area */}
      <Surface style={styles.inputContainer} elevation={4}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="質問を入力..."
          mode="outlined"
          style={styles.textInput}
          outlineStyle={styles.textInputOutline}
          multiline
          maxLength={1000}
          disabled={isLoading}
          right={
            <TextInput.Icon
              icon="send"
              color={inputText.trim() && !isLoading ? colors.primary : colors.grey400}
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
            />
          }
        />
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey200,
    backgroundColor: '#fff',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: `${colors.primary}15`,
  },
  newChatText: {
    fontSize: 13,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  messagesList: {
    paddingVertical: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  robotContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#fff',
    borderColor: colors.grey300,
    borderWidth: 1,
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: `${colors.primary}10`,
  },
  loadingText: {
    fontSize: 13,
    color: colors.primary,
    marginLeft: 8,
  },
  inputContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.grey200,
  },
  textInput: {
    backgroundColor: '#fff',
    maxHeight: 100,
  },
  textInputOutline: {
    borderRadius: 24,
  },
});

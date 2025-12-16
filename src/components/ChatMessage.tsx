// Chat Message component for AI chat display

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, Avatar } from 'react-native-paper';
import { ChatMessage as ChatMessageType } from '../types';
import { colors } from '../theme';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.container, isUser && styles.userContainer]}>
      {!isUser && (
        <Avatar.Icon
          size={32}
          icon="robot"
          style={styles.avatar}
          color="#fff"
        />
      )}
      <View style={[styles.messageWrapper, isUser && styles.userMessageWrapper]}>
        <Surface
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
          elevation={1}
        >
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {message.content}
          </Text>
          {message.sources && message.sources.length > 0 && (
            <View style={styles.sourcesContainer}>
              <Text style={styles.sourcesLabel}>参照:</Text>
              {message.sources.map((source, index) => (
                <Text key={index} style={styles.sourceText}>
                  • {source}
                </Text>
              ))}
            </View>
          )}
        </Surface>
        <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
      {isUser && (
        <Avatar.Icon
          size={32}
          icon="account"
          style={[styles.avatar, styles.userAvatar]}
          color="#fff"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'flex-end',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  avatar: {
    backgroundColor: colors.primary,
    marginBottom: 16,
  },
  userAvatar: {
    backgroundColor: colors.grey600,
  },
  messageWrapper: {
    flex: 1,
    maxWidth: '80%',
    marginLeft: 8,
  },
  userMessageWrapper: {
    marginLeft: 0,
    marginRight: 8,
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: colors.primaryLight,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  userMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 10,
    color: colors.grey500,
    marginTop: 4,
    marginLeft: 4,
  },
  userTimestamp: {
    marginLeft: 0,
    marginRight: 4,
  },
  sourcesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.grey200,
  },
  sourcesLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.grey600,
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 10,
    color: colors.grey500,
    marginLeft: 8,
  },
});

export default ChatMessage;

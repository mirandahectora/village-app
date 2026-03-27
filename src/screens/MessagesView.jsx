import React, { useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { colors, fonts } from '../theme'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getFirstName(name = '') {
  return name.split(' ')[0]
}

// ---------------------------------------------------------------------------
// InitialsCircle
// ---------------------------------------------------------------------------

function InitialsCircle({ initials, size = 44, bg = colors.creamDark, color = colors.ink }) {
  return (
    <View
      style={[
        styles.initialsCircle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}
    >
      <Text style={[styles.initialsText, { color, fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  )
}

// ---------------------------------------------------------------------------
// ConversationRow
// ---------------------------------------------------------------------------

function ConversationRow({ dm, isActive, onPress }) {
  const lastMsg = dm.messages && dm.messages.length > 0 ? dm.messages[dm.messages.length - 1] : null
  const preview = lastMsg ? lastMsg.text : dm.person?.headline ?? ''

  return (
    <TouchableOpacity
      style={[styles.convRow, isActive && styles.convRowActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {isActive && <View style={styles.convActiveBar} />}
      <InitialsCircle initials={dm.person?.initials ?? '??'} size={46} />
      <View style={styles.convRowContent}>
        <Text style={styles.convRowName} numberOfLines={1}>
          {dm.person?.name ?? 'Unknown'}
        </Text>
        <Text style={styles.convRowPreview} numberOfLines={1}>
          {preview}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

// ---------------------------------------------------------------------------
// ConversationList
// ---------------------------------------------------------------------------

function ConversationList({ dms, activeDMId, setActiveDMId }) {
  const renderItem = useCallback(
    ({ item }) => (
      <ConversationRow
        dm={item}
        isActive={item.personId === activeDMId}
        onPress={() => setActiveDMId(item.personId)}
      />
    ),
    [activeDMId, setActiveDMId],
  )

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Messages</Text>
        <Text style={styles.listSubtitle}>
          {dms.length} {dms.length === 1 ? 'conversation' : 'conversations'}
        </Text>
      </View>

      <View style={styles.listDivider} />

      {dms.length === 0 ? (
        // Empty state
        <View style={styles.emptyState}>
          <Feather name="message-square" size={48} color={colors.rule} />
          <Text style={styles.emptyTitle}>No messages yet.</Text>
          <Text style={styles.emptyBody}>
            Connect with people in Explore to start a conversation.
          </Text>
        </View>
      ) : (
        <FlatList
          data={dms}
          keyExtractor={(item) => item.personId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.rowSeparator} />}
        />
      )}
    </SafeAreaView>
  )
}

// ---------------------------------------------------------------------------
// MessageBubble
// ---------------------------------------------------------------------------

function MessageBubble({ message, showSpacer }) {
  const isMine = message.mine

  const bubbleStyle = isMine
    ? [styles.bubble, styles.bubbleMine]
    : [styles.bubble, styles.bubbleOther]

  const textStyle = isMine ? styles.bubbleTextMine : styles.bubbleTextOther

  return (
    <View style={[styles.messageRow, isMine ? styles.messageRowMine : styles.messageRowOther]}>
      <View style={styles.bubbleWrapper}>
        <View style={bubbleStyle}>
          <Text style={textStyle}>{message.text}</Text>
        </View>
        <Text style={[styles.timestamp, isMine ? styles.timestampMine : styles.timestampOther]}>
          {message.time}
        </Text>
      </View>
      {/* Spacer between groups */}
      {showSpacer && <View style={styles.groupSpacer} />}
    </View>
  )
}

// ---------------------------------------------------------------------------
// ChatPanel
// ---------------------------------------------------------------------------

function ChatPanel({ dm, setActiveDMId }) {
  const { sendDM } = useAuth()
  const [inputText, setInputText] = useState('')
  const listRef = useRef(null)

  const person = dm.person ?? {}
  const messages = dm.messages ?? []
  const firstName = getFirstName(person.name)

  const handleSend = useCallback(() => {
    const trimmed = inputText.trim()
    if (!trimmed) return
    sendDM(dm.personId, trimmed)
    setInputText('')
    // Scroll to bottom after send
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }, [inputText, dm.personId, sendDM])

  const handleLayout = useCallback(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: false })
    }
  }, [messages.length])

  // Determine group boundaries so we know when to add extra spacing
  const getShowSpacer = (index) => {
    if (index === messages.length - 1) return false
    const current = messages[index]
    const next = messages[index + 1]
    return current.mine !== next.mine
  }

  const renderMessage = useCallback(
    ({ item, index }) => (
      <MessageBubble message={item} showSpacer={getShowSpacer(index)} />
    ),
    [messages],
  )

  const locationGoal = [person.location, person.goal].filter(Boolean).join(' · ')

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
      {/* Chat Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setActiveDMId(null)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={22} color={colors.ink} />
        </TouchableOpacity>

        <InitialsCircle
          initials={person.initials ?? '??'}
          size={40}
          bg={colors.creamDark}
          color={colors.ink}
        />

        <View style={styles.chatHeaderText}>
          <Text style={styles.chatHeaderName} numberOfLines={1}>
            {person.name ?? 'Unknown'}
          </Text>
          {locationGoal ? (
            <Text style={styles.chatHeaderSub} numberOfLines={1}>
              {locationGoal}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.listDivider} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {messages.length === 0 ? (
          // Empty messages placeholder
          <View style={styles.chatEmptyState}>
            <Text style={styles.chatEmptyText}>
              Say hello to {firstName}.{' '}
              {person.match != null
                ? `You matched ${person.match}% on financial goals.`
                : ''}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onLayout={handleLayout}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input row */}
        <SafeAreaView edges={['bottom']} style={styles.inputSafeArea}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={`Message ${firstName}…`}
              placeholderTextColor={colors.inkMuted}
              multiline
              maxLength={1000}
              returnKeyType="default"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <Feather name="send" size={18} color={colors.cream} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// ---------------------------------------------------------------------------
// MessagesView — top-level export
// ---------------------------------------------------------------------------

export default function MessagesView({ activeDMId, setActiveDMId }) {
  const { dms } = useAuth()

  const activeDM = activeDMId ? dms.find((d) => d.personId === activeDMId) ?? null : null

  if (activeDM) {
    return (
      <View style={styles.screen}>
        <ChatPanel dm={activeDM} setActiveDMId={setActiveDMId} />
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <ConversationList dms={dms} activeDMId={activeDMId} setActiveDMId={setActiveDMId} />
    </View>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Layout
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  flex: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  // InitialsCircle
  initialsCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: fonts.sans,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // ConversationList header
  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  listTitle: {
    fontFamily: fonts.serif,
    fontSize: 26,
    color: colors.ink,
    marginBottom: 2,
  },
  listSubtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkMuted,
  },
  listDivider: {
    height: 1,
    backgroundColor: colors.rule,
    opacity: 0.5,
  },
  listContent: {
    paddingVertical: 8,
  },

  // ConversationRow
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: colors.cream,
    position: 'relative',
  },
  convRowActive: {
    backgroundColor: '#D9EBC8', // light green tint
  },
  convActiveBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.green,
    borderRadius: 2,
  },
  convRowContent: {
    flex: 1,
    marginLeft: 12,
  },
  convRowName: {
    fontFamily: fonts.sans,
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 3,
  },
  convRowPreview: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkMuted,
  },
  rowSeparator: {
    height: 1,
    backgroundColor: colors.rule,
    opacity: 0.3,
    marginLeft: 78, // align with text after avatar
  },

  // Empty states
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  emptyTitle: {
    fontFamily: fonts.sans,
    fontSize: 16,
    fontWeight: '600',
    color: colors.inkMuted,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ChatPanel header
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.cream,
  },
  backButton: {
    marginRight: 12,
    padding: 2,
  },
  chatHeaderText: {
    flex: 1,
    marginLeft: 10,
  },
  chatHeaderName: {
    fontFamily: fonts.sans,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  chatHeaderSub: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 1,
  },

  // Messages list
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageRow: {
    marginBottom: 4,
  },
  messageRowMine: {
    alignItems: 'flex-end',
  },
  messageRowOther: {
    alignItems: 'flex-start',
  },
  bubbleWrapper: {
    maxWidth: '78%',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: colors.green,
    borderRadius: 12,
    borderBottomRightRadius: 2,
    alignSelf: 'flex-end',
  },
  bubbleOther: {
    backgroundColor: colors.creamMid,
    borderRadius: 12,
    borderBottomLeftRadius: 2,
    alignSelf: 'flex-start',
  },
  bubbleTextMine: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.cream,
    lineHeight: 21,
  },
  bubbleTextOther: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
    lineHeight: 21,
  },
  timestamp: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 3,
  },
  timestampMine: {
    textAlign: 'right',
  },
  timestampOther: {
    textAlign: 'left',
  },
  groupSpacer: {
    height: 8,
  },

  // Chat empty state
  chatEmptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  chatEmptyText: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Input row
  inputSafeArea: {
    backgroundColor: colors.cream,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.creamMid,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
    maxHeight: 120,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.creamDark,
  },
})

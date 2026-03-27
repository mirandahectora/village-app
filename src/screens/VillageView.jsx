import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import Svg, { Polyline, Line, Text as SvgText, Circle } from 'react-native-svg'
import { Feather } from '@expo/vector-icons'
import { colors } from '../theme'
import { STRUCTURE_LABELS } from '../constants/financial'
import { useAuth } from '../context/AuthContext'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const TABS = ['overview', 'chat', 'votes', 'members', 'constitution']
const TAB_LABELS = {
  overview:     'Overview',
  chat:         'Chat',
  votes:        'Votes',
  members:      'Members',
  constitution: 'Constitution',
}
const TAB_ICONS = {
  overview:     'activity',
  chat:         'message-circle',
  votes:        'check-square',
  members:      'users',
  constitution: 'file-text',
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n == null) return '—'
  return '$' + Number(n).toLocaleString('en-US')
}

function pct(num, denom) {
  if (!denom) return 0
  return Math.min(100, Math.round((num / denom) * 100))
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function timeAgo(expiresAt) {
  const diff = expiresAt - Date.now()
  if (diff <= 0) return 'Expired'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  if (days > 0) return `${days}d ${hours}h left`
  const mins = Math.floor((diff % 3600000) / 60000)
  if (hours > 0) return `${hours}h ${mins}m left`
  return `${mins}m left`
}

// ─── Avatar ─────────────────────────────────────────────────────────────────

function Avatar({ photo, initials, size = 36, borderColor }) {
  const style = [
    styles.avatar,
    { width: size, height: size, borderRadius: size / 2 },
    borderColor ? { borderWidth: 2, borderColor } : null,
  ]
  if (photo) {
    return <Image source={{ uri: photo }} style={style} />
  }
  return (
    <View style={[style, styles.avatarFallback]}>
      <Text style={[styles.avatarInitials, { fontSize: size * 0.35 }]}>
        {initials || '?'}
      </Text>
    </View>
  )
}

// ─── Pool Progress Bar ───────────────────────────────────────────────────────

function ProgressBar({ pooled, target }) {
  const percent = pct(pooled, target)
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressLeft}>{fmt(pooled)} pooled</Text>
        <Text style={styles.progressRight}>{percent}% of {fmt(target)}</Text>
      </View>
    </View>
  )
}

// ─── Stats Grid ─────────────────────────────────────────────────────────────

function StatsGrid({ village }) {
  const { pooled, target, members, structure } = village
  const acctType = structure?.accountType || 'hysa'

  let stats = []
  if (acctType === 'hysa') {
    stats = [
      { label: 'Pool Balance',    value: fmt(pooled) },
      { label: 'APY',             value: '4.85%' },
      { label: 'Interest Earned', value: fmt(Math.round(pooled * 0.0485 * (3 / 12))) },
      { label: 'Members',         value: `${members}` },
    ]
  } else if (acctType === 'checking') {
    const totalAllocated = (village.recentActivity || [])
      .filter(a => a.type === 'allocation')
      .reduce((s, a) => s + (a.amount || 0), 0)
    stats = [
      { label: 'Pool Balance',      value: fmt(pooled) },
      { label: 'Total Contributed', value: fmt(village.myContribution * members) },
      { label: 'Total Allocated',   value: fmt(totalAllocated) },
      { label: 'Members',           value: `${members}` },
    ]
  } else {
    const gain = Math.round(pooled * 0.072 * 0.4)
    stats = [
      { label: 'Portfolio Value',    value: fmt(pooled) },
      { label: 'Est. Annual Return', value: '7.2%' },
      { label: 'Unrealized Gain',    value: fmt(gain) },
      { label: 'Members',            value: `${members}` },
    ]
  }

  return (
    <View style={styles.statsGrid}>
      {stats.map((s, i) => (
        <View key={i} style={[styles.statCard, i % 2 === 1 && styles.statCardRight]}>
          <Text style={styles.statValue}>{s.value}</Text>
          <Text style={styles.statLabel}>{s.label}</Text>
        </View>
      ))}
    </View>
  )
}

// ─── Line Chart ─────────────────────────────────────────────────────────────

function PoolLineChart({ recentActivity }) {
  const contributions = (recentActivity || [])
    .filter(a => a.type === 'contribution')
    .slice()
    .reverse()

  if (contributions.length < 2) return null

  const chartW = SCREEN_WIDTH - 48
  const chartH = 90
  const padding = { left: 8, right: 8, top: 12, bottom: 20 }
  const innerW = chartW - padding.left - padding.right
  const innerH = chartH - padding.top - padding.bottom

  let running = 0
  const points = contributions.map((c, i) => {
    running += c.amount || 0
    return { x: i, y: running, label: c.date }
  })

  const maxY = Math.max(...points.map(p => p.y))
  const minY = 0

  const toX = (i) => padding.left + (i / (points.length - 1)) * innerW
  const toY = (v) => padding.top + innerH - ((v - minY) / (maxY - minY || 1)) * innerH

  const polyPoints = points.map((p, i) => `${toX(i)},${toY(p.y)}`).join(' ')

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.sectionLabel}>Pool Growth</Text>
      <Svg width={chartW} height={chartH}>
        <Line
          x1={padding.left} y1={padding.top + innerH}
          x2={chartW - padding.right} y2={padding.top + innerH}
          stroke={colors.rule} strokeWidth="1"
        />
        <Polyline
          points={polyPoints}
          fill="none"
          stroke={colors.green}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <Circle
            key={i}
            cx={toX(i)}
            cy={toY(p.y)}
            r="3"
            fill={colors.green}
          />
        ))}
        <SvgText
          x={toX(0)}
          y={chartH - 4}
          fontSize="9"
          fill={colors.inkMuted}
          textAnchor="start"
        >
          {points[0].label}
        </SvgText>
        <SvgText
          x={toX(points.length - 1)}
          y={chartH - 4}
          fontSize="9"
          fill={colors.inkMuted}
          textAnchor="end"
        >
          {points[points.length - 1].label}
        </SvgText>
      </Svg>
    </View>
  )
}

// ─── Activity Item ───────────────────────────────────────────────────────────

function ActivityItem({ item }) {
  const iconMap = {
    contribution: { name: 'trending-up', color: colors.green },
    vote:         { name: 'check-square', color: colors.inkMuted },
    allocation:   { name: 'dollar-sign', color: colors.terracotta },
    join:         { name: 'user-check', color: colors.greenMid },
  }
  const icon = iconMap[item.type] || { name: 'activity', color: colors.inkMuted }
  return (
    <View style={styles.activityRow}>
      <View style={[styles.activityIcon, { backgroundColor: icon.color + '18' }]}>
        <Feather name={icon.name} size={14} color={icon.color} />
      </View>
      <View style={styles.activityBody}>
        <Text style={styles.activityNote} numberOfLines={2}>{item.note}</Text>
        <Text style={styles.activityMeta}>{item.actor} · {item.date}</Text>
      </View>
      {item.amount ? (
        <Text style={styles.activityAmount}>{fmt(item.amount)}</Text>
      ) : null}
    </View>
  )
}

// ─── My Contribution Card ────────────────────────────────────────────────────

function MyContributionCard({ village }) {
  return (
    <View style={styles.myContribCard}>
      <View style={styles.myContribRow}>
        <View>
          <Text style={styles.myContribLabel}>My Total Contributed</Text>
          <Text style={styles.myContribValue}>{fmt(village.myContribution)}</Text>
        </View>
        <View style={styles.myContribDivider} />
        <View style={styles.myContribRight}>
          <Text style={styles.myContribLabel}>Next Due</Text>
          <Text style={styles.myContribValue}>{fmt(village.nextContribution)}</Text>
          <Text style={styles.myContribDate}>{village.nextDate} · {village.intervalLabel}</Text>
        </View>
      </View>
    </View>
  )
}

// ─── Member Avatars Row ──────────────────────────────────────────────────────

function MemberAvatarsRow({ memberList }) {
  const maxShow = 10
  const shown = (memberList || []).slice(0, maxShow)
  return (
    <View style={styles.avatarRow}>
      {shown.map((m, i) => (
        <View key={m.id || i} style={styles.avatarWrap}>
          <Avatar
            photo={m.photo}
            initials={m.initials}
            size={38}
            borderColor={m.status === 'active' ? colors.green : colors.rule}
          />
        </View>
      ))}
      {(memberList || []).length > maxShow && (
        <View style={[styles.avatarWrap, styles.avatarMore]}>
          <Text style={styles.avatarMoreText}>+{(memberList || []).length - maxShow}</Text>
        </View>
      )}
    </View>
  )
}

// ─── Overview Tab ───────────────────────────────────────────────────────────

function OverviewTab({ village }) {
  return (
    <ScrollView style={styles.tabScroll} contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
      <ProgressBar pooled={village.pooled} target={village.target} />
      <StatsGrid village={village} />

      <Text style={styles.sectionLabel}>Contributors</Text>
      <MemberAvatarsRow memberList={village.memberList} />

      <PoolLineChart recentActivity={village.recentActivity} />

      <MyContributionCard village={village} />

      <Text style={styles.sectionLabel}>Recent Activity</Text>
      {(village.recentActivity || []).map((item, i) => (
        <ActivityItem key={i} item={item} />
      ))}
    </ScrollView>
  )
}

// ─── Chat Tab ───────────────────────────────────────────────────────────────

function ChatTab({ village }) {
  const { sendMessage } = useAuth()
  const [text, setText] = useState('')
  const scrollRef = useRef(null)

  const messages = village.chat || []

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: false })
    }, 80)
    return () => clearTimeout(t)
  }, [messages.length])

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed) return
    sendMessage(village.id, trimmed)
    setText('')
  }, [text, village.id, sendMessage])

  return (
    <KeyboardAvoidingView
      style={styles.chatOuter}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={120}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[styles.msgRow, msg.mine ? styles.msgRowMine : styles.msgRowOther]}
          >
            {!msg.mine && (
              <Avatar photo={msg.photo} initials={msg.initials} size={30} />
            )}
            <View style={[styles.msgBubbleWrap, msg.mine ? styles.msgBubbleWrapMine : styles.msgBubbleWrapOther]}>
              {!msg.mine && (
                <Text style={styles.msgAuthor}>{msg.author}</Text>
              )}
              <View style={[styles.msgBubble, msg.mine ? styles.msgBubbleMine : styles.msgBubbleOther]}>
                <Text style={[styles.msgText, msg.mine ? styles.msgTextMine : styles.msgTextOther]}>
                  {msg.text}
                </Text>
              </View>
              <Text style={[styles.msgTime, msg.mine ? styles.msgTimeMine : styles.msgTimeOther]}>
                {msg.time}
              </Text>
            </View>
            {msg.mine && (
              <Avatar photo={msg.photo} initials={msg.initials} size={30} />
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.chatInputRow}>
        <TextInput
          style={styles.chatInput}
          placeholder="Message the village…"
          placeholderTextColor={colors.inkMuted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
          returnKeyType="default"
        />
        <TouchableOpacity
          style={[styles.chatSendBtn, !text.trim() && styles.chatSendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Feather name="send" size={18} color={text.trim() ? colors.cream : colors.rule} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

// ─── Vote Bar ────────────────────────────────────────────────────────────────

function VoteBar({ yes, no, abstain, total }) {
  const safeTotal = total || 1
  const yPct  = Math.round((yes     / safeTotal) * 100)
  const nPct  = Math.round((no      / safeTotal) * 100)
  const aPct  = Math.round((abstain / safeTotal) * 100)

  return (
    <View>
      <View style={styles.voteBarTrack}>
        {yPct > 0 && <View style={[styles.voteBarSeg, styles.voteBarYes,     { flex: yes     }]} />}
        {nPct > 0 && <View style={[styles.voteBarSeg, styles.voteBarNo,      { flex: no      }]} />}
        {aPct > 0 && <View style={[styles.voteBarSeg, styles.voteBarAbstain, { flex: abstain }]} />}
        {(safeTotal - yes - no - abstain) > 0 && (
          <View style={[styles.voteBarSeg, styles.voteBarEmpty, { flex: safeTotal - yes - no - abstain }]} />
        )}
      </View>
      <View style={styles.voteBarLegend}>
        <Text style={styles.voteBarLegendItem}><Text style={styles.voteYesText}>Yes {yes}</Text></Text>
        <Text style={styles.voteBarLegendItem}><Text style={styles.voteNoText}>No {no}</Text></Text>
        <Text style={styles.voteBarLegendItem}><Text style={styles.voteAbstainText}>Abstain {abstain}</Text></Text>
        <Text style={styles.voteBarLegendItem}><Text style={styles.voteNotVotedText}>Not voted {safeTotal - yes - no - abstain}</Text></Text>
      </View>
    </View>
  )
}

// ─── Draft Resolution Modal ──────────────────────────────────────────────────

function DraftModal({ visible, onClose, onSubmit }) {
  const [title, setTitle]       = useState('')
  const [description, setDesc]  = useState('')
  const [amount, setAmount]     = useState('')

  const handleSubmit = () => {
    if (!title.trim()) return
    onSubmit({ title: title.trim(), description: description.trim(), amount: amount.trim() })
    setTitle(''); setDesc(''); setAmount('')
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalKAV}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Draft Resolution</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x-circle" size={22} color={colors.inkMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalFieldLabel}>Title *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Allocate $2,000 to member X"
              placeholderTextColor={colors.inkMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.modalFieldLabel}>Description</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextarea]}
              placeholder="Provide context for the vote…"
              placeholderTextColor={colors.inkMuted}
              value={description}
              onChangeText={setDesc}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.modalFieldLabel}>Amount (optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="0"
              placeholderTextColor={colors.inkMuted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, !title.trim() && styles.modalSubmitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!title.trim()}
              >
                <Text style={styles.modalSubmitText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

// ─── Open Vote Card ──────────────────────────────────────────────────────────

function OpenVoteCard({ vote, villageId }) {
  const { castVote } = useAuth()
  const voted = vote.myVote !== null && vote.myVote !== undefined

  const CHOICES = [
    { key: 'yes',     label: 'Yes',     icon: 'check-circle', color: colors.green },
    { key: 'no',      label: 'No',      icon: 'x-circle',     color: colors.terracotta },
    { key: 'abstain', label: 'Abstain', icon: 'minus',        color: colors.inkMuted },
  ]

  return (
    <View style={styles.voteCard}>
      <View style={styles.voteCardHeader}>
        <Text style={styles.voteCardTitle}>{vote.title}</Text>
        {vote.amount ? (
          <View style={styles.voteAmountBadge}>
            <Feather name="dollar-sign" size={11} color={colors.terracotta} />
            <Text style={styles.voteAmountText}>{Number(vote.amount).toLocaleString()}</Text>
          </View>
        ) : null}
      </View>

      {vote.description ? (
        <Text style={styles.voteDesc}>{vote.description}</Text>
      ) : null}

      <View style={styles.voteMetaRow}>
        <Text style={styles.voteMeta}>Proposed by {vote.proposedBy}</Text>
        <View style={styles.voteExpiry}>
          <Feather name="clock" size={11} color={colors.inkMuted} />
          <Text style={styles.voteExpiryText}>{timeAgo(vote.expiresAt)}</Text>
        </View>
      </View>

      {voted ? (
        <View>
          <VoteBar yes={vote.yes} no={vote.no} abstain={vote.abstain} total={vote.total} />
          <Text style={styles.myVoteLabel}>
            You voted <Text style={styles.myVoteChoice}>{vote.myVote.toUpperCase()}</Text>
          </Text>
        </View>
      ) : (
        <View style={styles.voteButtons}>
          {CHOICES.map(c => (
            <TouchableOpacity
              key={c.key}
              style={[styles.voteBtn, { borderColor: c.color }]}
              onPress={() => castVote(villageId, vote.id, c.key)}
            >
              <Feather name={c.icon} size={14} color={c.color} />
              <Text style={[styles.voteBtnText, { color: c.color }]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

// ─── Past Vote Card ──────────────────────────────────────────────────────────

function PastVoteCard({ vote }) {
  const passed = vote.status === 'passed'
  return (
    <View style={styles.pastVoteCard}>
      <View style={styles.pastVoteRow}>
        <Text style={styles.pastVoteTitle} numberOfLines={2}>{vote.title}</Text>
        <View style={[styles.statusBadge, passed ? styles.badgePassed : styles.badgeFailed]}>
          <Text style={[styles.statusBadgeText, passed ? styles.badgePassedText : styles.badgeFailedText]}>
            {passed ? 'Passed' : 'Failed'}
          </Text>
        </View>
      </View>
      <VoteBar yes={vote.yes} no={vote.no} abstain={vote.abstain} total={vote.total} />
      {vote.myVote ? (
        <Text style={styles.myVoteLabelSmall}>You voted {vote.myVote}</Text>
      ) : null}
    </View>
  )
}

// ─── Votes Tab ───────────────────────────────────────────────────────────────

function VotesTab({ village }) {
  const { draftResolution } = useAuth()
  const [modalVisible, setModalVisible] = useState(false)

  const open = (village.votes || []).filter(v => v.status === 'open')
  const past = (village.votes || []).filter(v => v.status !== 'open')

  return (
    <ScrollView style={styles.tabScroll} contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.draftBtn} onPress={() => setModalVisible(true)}>
        <Feather name="plus" size={16} color={colors.cream} />
        <Text style={styles.draftBtnText}>Draft Resolution</Text>
      </TouchableOpacity>

      {open.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Open Votes</Text>
          {open.map(v => (
            <OpenVoteCard key={v.id} vote={v} villageId={village.id} />
          ))}
        </>
      )}

      {past.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Past Votes</Text>
          {past.map(v => (
            <PastVoteCard key={v.id} vote={v} />
          ))}
        </>
      )}

      {open.length === 0 && past.length === 0 && (
        <View style={styles.emptyState}>
          <Feather name="check-square" size={32} color={colors.rule} />
          <Text style={styles.emptyStateText}>No votes yet</Text>
        </View>
      )}

      <DraftModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={(data) => draftResolution(village.id, data)}
      />
    </ScrollView>
  )
}

// ─── Member Row ──────────────────────────────────────────────────────────────

function MemberRow({ member }) {
  const isActive = member.status === 'active'
  return (
    <View style={styles.memberRow}>
      <Avatar photo={member.photo} initials={member.initials} size={42} />
      <View style={styles.memberInfo}>
        <View style={styles.memberNameRow}>
          <Text style={styles.memberName}>{member.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{member.role}</Text>
          </View>
        </View>
        <Text style={styles.memberContrib}>Contributed {fmt(member.contrib)}</Text>
        {member.joined ? (
          <Text style={styles.memberJoined}>Joined {member.joined}</Text>
        ) : null}
      </View>
      <View style={[styles.statusDot, isActive ? styles.statusDotActive : styles.statusDotPending]} />
    </View>
  )
}

// ─── Join Request Row ────────────────────────────────────────────────────────

function JoinRequestRow({ req }) {
  return (
    <View style={styles.joinReqCard}>
      <View style={styles.joinReqHeader}>
        <Avatar photo={req.photo} initials={req.initials} size={40} />
        <View style={styles.joinReqInfo}>
          <Text style={styles.joinReqName}>{req.name}</Text>
          <Text style={styles.joinReqMeta}>{req.handle} · {req.location}</Text>
          <Text style={styles.joinReqDate}>Requested {req.requestedAt}</Text>
        </View>
      </View>
      {req.message ? (
        <Text style={styles.joinReqMsg} numberOfLines={3}>{req.message}</Text>
      ) : (
        <Text style={styles.joinReqNoMsg}>No message provided.</Text>
      )}
      <View style={styles.joinReqActions}>
        <TouchableOpacity style={styles.joinAcceptBtn}>
          <Feather name="user-check" size={14} color={colors.cream} />
          <Text style={styles.joinAcceptText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.joinDeclineBtn}>
          <Feather name="x-circle" size={14} color={colors.terracotta} />
          <Text style={styles.joinDeclineText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ─── Members Tab ─────────────────────────────────────────────────────────────

function MembersTab({ village, onLeave }) {
  const requests = village.joinRequests || []
  return (
    <ScrollView style={styles.tabScroll} contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionLabel}>
        Members ({village.members}/{village.maxMembers})
      </Text>
      {(village.memberList || []).map((m) => (
        <MemberRow key={m.id} member={m} />
      ))}

      {requests.length > 0 && (
        <>
          <View style={styles.sectionDivider} />
          <Text style={styles.sectionLabel}>Join Requests ({requests.length})</Text>
          {requests.map((r) => (
            <JoinRequestRow key={r.id} req={r} />
          ))}
        </>
      )}

      <View style={styles.leaveSection}>
        <TouchableOpacity style={styles.leaveBtn} onPress={onLeave}>
          <Feather name="alert-circle" size={16} color={colors.terracotta} />
          <Text style={styles.leaveBtnText}>Leave Village</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

// ─── Constitution Tab ────────────────────────────────────────────────────────

const STRUCTURE_FIELD_ORDER = [
  'accountType',
  'payInFrequency',
  'payoutStructure',
  'amendmentThreshold',
  'quorum',
  'dishonorableExit',
  'probationPeriod',
  'latePaymentPolicy',
  'exitNoticePeriod',
  'memberAdmission',
]

const STRUCTURE_DISPLAY_KEYS = {
  accountType:        'Account Type',
  payInFrequency:     'Pay-In Frequency',
  payoutStructure:    'Payout Structure',
  amendmentThreshold: 'Amendment Threshold',
  quorum:             'Quorum',
  dishonorableExit:   'Dishonorable Exit',
  probationPeriod:    'Probation Period',
  latePaymentPolicy:  'Late Payment Policy',
  exitNoticePeriod:   'Exit Notice Period',
  memberAdmission:    'Member Admission',
}

const PORTFOLIO_ALLOC_LABELS = {
  stocks: 'Stocks / ETFs',
  bonds:  'Bonds',
  cash:   'Cash',
  other:  'Other',
}

function ConstitutionTab({ village }) {
  const structure = village.structure || {}
  const isBrokerage = structure.accountType === 'brokerage'

  return (
    <ScrollView style={styles.tabScroll} contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.constitCard}>
        <View style={styles.constitHeaderRow}>
          <Feather name="file-text" size={16} color={colors.green} />
          <Text style={styles.constitTitle}>{village.name} · Charter</Text>
        </View>
        <Text style={styles.constitFounded}>Founded {village.founded}</Text>
        <Text style={styles.constitGoal}>Goal: {village.goal}</Text>
      </View>

      <View style={styles.constitTable}>
        {STRUCTURE_FIELD_ORDER.map((key, i) => {
          const rawVal = structure[key]
          const lookupMap = STRUCTURE_LABELS[key]
          const displayVal = rawVal && lookupMap && lookupMap[rawVal]
            ? lookupMap[rawVal]
            : rawVal ?? '—'

          return (
            <View
              key={key}
              style={[styles.constitRow, i % 2 === 0 ? styles.constitRowEven : styles.constitRowOdd]}
            >
              <Text style={styles.constitRowLabel}>{STRUCTURE_DISPLAY_KEYS[key] || key}</Text>
              <Text style={styles.constitRowValue}>{displayVal}</Text>
            </View>
          )
        })}

        <View style={[styles.constitRow, STRUCTURE_FIELD_ORDER.length % 2 === 0 ? styles.constitRowEven : styles.constitRowOdd]}>
          <Text style={styles.constitRowLabel}>Pool Target</Text>
          <Text style={styles.constitRowValue}>{fmt(structure.poolTarget)}</Text>
        </View>
        <View style={[styles.constitRow, (STRUCTURE_FIELD_ORDER.length + 1) % 2 === 0 ? styles.constitRowEven : styles.constitRowOdd]}>
          <Text style={styles.constitRowLabel}>Min. Contribution</Text>
          <Text style={styles.constitRowValue}>{fmt(structure.minContribution)}</Text>
        </View>
      </View>

      {isBrokerage && structure.allocation && (
        <View style={styles.constitCard}>
          <Text style={[styles.sectionLabel, { marginBottom: 8 }]}>Portfolio Allocation</Text>
          {Object.entries(structure.allocation).map(([k, v], i) => (
            <View key={k} style={styles.allocRow}>
              <Text style={styles.allocLabel}>{PORTFOLIO_ALLOC_LABELS[k] || k}</Text>
              <View style={styles.allocBarTrack}>
                <View style={[styles.allocBarFill, { width: `${v}%` }]} />
              </View>
              <Text style={styles.allocPct}>{v}%</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────

function VillageHeader({ village, tab, setTab }) {
  const openVoteCount = (village.votes || []).filter(v => v.status === 'open').length

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Image source={{ uri: village.photo }} style={styles.headerPhoto} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={2}>{village.name}</Text>
          <Text style={styles.headerGoal}>{village.goal}</Text>
          <Text style={styles.headerMeta}>
            {village.members}/{village.maxMembers} members · Founded {village.founded}
          </Text>
        </View>
        {openVoteCount > 0 && (
          <View style={styles.alertBadge}>
            <Feather name="alert-circle" size={11} color={colors.cream} />
            <Text style={styles.alertBadgeText}>{openVoteCount}</Text>
          </View>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map(t => {
          const active = tab === t
          return (
            <TouchableOpacity
              key={t}
              style={[styles.tabItem, active && styles.tabItemActive]}
              onPress={() => setTab(t)}
            >
              <Feather
                name={TAB_ICONS[t]}
                size={14}
                color={active ? colors.green : colors.inkMuted}
              />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {TAB_LABELS[t]}
              </Text>
              {t === 'votes' && openVoteCount > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{openVoteCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function VillageView({ village, tab, setTab, onLeave }) {
  if (!village) return null

  return (
    <View style={styles.root}>
      <VillageHeader village={village} tab={tab} setTab={setTab} />

      <View style={styles.tabBody}>
        {tab === 'overview'     && <OverviewTab     village={village} />}
        {tab === 'chat'         && <ChatTab         village={village} />}
        {tab === 'votes'        && <VotesTab        village={village} />}
        {tab === 'members'      && <MembersTab      village={village} onLeave={onLeave} />}
        {tab === 'constitution' && <ConstitutionTab village={village} />}
      </View>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  // Header
  header: {
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  headerPhoto: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: colors.creamDark,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
    lineHeight: 22,
  },
  headerGoal: {
    fontSize: 13,
    color: colors.greenMid,
    fontWeight: '500',
    marginTop: 2,
  },
  headerMeta: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.terracotta,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 3,
    alignSelf: 'flex-start',
  },
  alertBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.cream,
  },

  // Tab bar
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  tabBarContent: {
    paddingHorizontal: 8,
    paddingBottom: 0,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    position: 'relative',
  },
  tabItemActive: {
    borderBottomColor: colors.green,
  },
  tabLabel: {
    fontSize: 13,
    color: colors.inkMuted,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.green,
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: colors.terracotta,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.cream,
  },

  // Tab body
  tabBody: {
    flex: 1,
  },
  tabScroll: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Progress bar
  progressContainer: {
    marginBottom: 16,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.creamDark,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.green,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressLeft: {
    fontSize: 12,
    color: colors.inkMuted,
  },
  progressRight: {
    fontSize: 12,
    color: colors.green,
    fontWeight: '600',
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: (SCREEN_WIDTH - 48 - 10) / 2,
    backgroundColor: colors.creamMid,
    borderRadius: 10,
    padding: 12,
  },
  statCardRight: {},
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
  },
  statLabel: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
  },

  // Section label
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.rule,
    marginVertical: 20,
  },

  // Avatar row
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  avatarWrap: {
    alignItems: 'center',
  },
  avatarMore: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkMuted,
  },

  // Avatar base
  avatar: {
    backgroundColor: colors.creamDark,
  },
  avatarFallback: {
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: colors.cream,
    fontWeight: '700',
  },

  // Chart
  chartContainer: {
    marginBottom: 20,
  },

  // Activity
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  activityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  activityBody: {
    flex: 1,
  },
  activityNote: {
    fontSize: 13,
    color: colors.ink,
    lineHeight: 18,
  },
  activityMeta: {
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.green,
    alignSelf: 'flex-start',
    paddingTop: 1,
  },

  // My contribution card
  myContribCard: {
    backgroundColor: colors.green,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    marginTop: 8,
  },
  myContribRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myContribLabel: {
    fontSize: 11,
    color: colors.greenLight,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  myContribValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.cream,
  },
  myContribDate: {
    fontSize: 11,
    color: colors.greenLight,
    marginTop: 2,
  },
  myContribDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.greenMid,
    marginHorizontal: 16,
  },
  myContribRight: {
    flex: 1,
  },

  // Chat
  chatOuter: {
    flex: 1,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 8,
    gap: 12,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 4,
  },
  msgRowMine: {
    justifyContent: 'flex-end',
  },
  msgRowOther: {
    justifyContent: 'flex-start',
  },
  msgBubbleWrap: {
    maxWidth: SCREEN_WIDTH * 0.68,
  },
  msgBubbleWrapMine: {
    alignItems: 'flex-end',
  },
  msgBubbleWrapOther: {
    alignItems: 'flex-start',
  },
  msgAuthor: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.inkMuted,
    marginBottom: 3,
    marginLeft: 4,
  },
  msgBubble: {
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  msgBubbleMine: {
    backgroundColor: colors.green,
    borderBottomRightRadius: 4,
  },
  msgBubbleOther: {
    backgroundColor: colors.creamMid,
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  msgTextMine: {
    color: colors.cream,
  },
  msgTextOther: {
    color: colors.ink,
  },
  msgTime: {
    fontSize: 10,
    marginTop: 3,
    color: colors.inkMuted,
  },
  msgTimeMine: {
    textAlign: 'right',
    marginRight: 2,
  },
  msgTimeOther: {
    marginLeft: 2,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    backgroundColor: colors.cream,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.creamMid,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.ink,
    maxHeight: 100,
    lineHeight: 20,
  },
  chatSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSendBtnDisabled: {
    backgroundColor: colors.creamDark,
  },

  // Votes
  draftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.green,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    justifyContent: 'center',
  },
  draftBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.cream,
  },
  voteCard: {
    backgroundColor: colors.creamMid,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  voteCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  voteCardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    lineHeight: 20,
  },
  voteAmountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.terraLight,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
  },
  voteAmountText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.terracotta,
  },
  voteDesc: {
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 18,
    marginBottom: 10,
  },
  voteMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  voteMeta: {
    fontSize: 12,
    color: colors.inkMuted,
  },
  voteExpiry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voteExpiryText: {
    fontSize: 12,
    color: colors.inkMuted,
  },
  voteButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  voteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 9,
  },
  voteBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  myVoteLabel: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  myVoteChoice: {
    fontWeight: '700',
    color: colors.green,
  },
  myVoteLabelSmall: {
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 4,
  },

  // Vote bar
  voteBarTrack: {
    flexDirection: 'row',
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.creamDark,
    marginTop: 4,
  },
  voteBarSeg: {
    height: '100%',
  },
  voteBarYes: {
    backgroundColor: colors.green,
  },
  voteBarNo: {
    backgroundColor: colors.terracotta,
  },
  voteBarAbstain: {
    backgroundColor: colors.inkMuted,
  },
  voteBarEmpty: {
    backgroundColor: colors.creamDark,
  },
  voteBarLegend: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
    flexWrap: 'wrap',
  },
  voteBarLegendItem: {
    fontSize: 11,
    color: colors.inkMuted,
  },
  voteYesText: {
    color: colors.green,
    fontWeight: '600',
  },
  voteNoText: {
    color: colors.terracotta,
    fontWeight: '600',
  },
  voteAbstainText: {
    color: colors.inkMuted,
    fontWeight: '600',
  },
  voteNotVotedText: {
    color: colors.rule,
  },

  // Past vote card
  pastVoteCard: {
    backgroundColor: colors.creamMid,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  pastVoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  pastVoteTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    lineHeight: 18,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgePassed: {
    backgroundColor: colors.greenLight,
  },
  badgeFailed: {
    backgroundColor: colors.terraLight,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgePassedText: {
    color: colors.green,
  },
  badgeFailedText: {
    color: colors.terracotta,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 15,
    color: colors.inkMuted,
  },

  // Members
  memberRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  roleBadge: {
    backgroundColor: colors.creamDark,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  roleBadgeText: {
    fontSize: 11,
    color: colors.inkMuted,
    fontWeight: '500',
  },
  memberContrib: {
    fontSize: 13,
    color: colors.green,
    fontWeight: '500',
  },
  memberJoined: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  statusDotActive: {
    backgroundColor: colors.green,
  },
  statusDotPending: {
    backgroundColor: colors.rule,
  },

  // Join requests
  joinReqCard: {
    backgroundColor: colors.creamMid,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  joinReqHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  joinReqInfo: {
    flex: 1,
  },
  joinReqName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  joinReqMeta: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
  },
  joinReqDate: {
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 2,
  },
  joinReqMsg: {
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  joinReqNoMsg: {
    fontSize: 13,
    color: colors.rule,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  joinReqActions: {
    flexDirection: 'row',
    gap: 10,
  },
  joinAcceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.green,
    borderRadius: 8,
    paddingVertical: 9,
  },
  joinAcceptText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.cream,
  },
  joinDeclineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.terracotta,
    borderRadius: 8,
    paddingVertical: 9,
  },
  joinDeclineText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.terracotta,
  },

  // Leave
  leaveSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.terracotta,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  leaveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.terracotta,
  },

  // Constitution
  constitCard: {
    backgroundColor: colors.creamMid,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  constitHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  constitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  constitFounded: {
    fontSize: 12,
    color: colors.inkMuted,
    marginBottom: 2,
  },
  constitGoal: {
    fontSize: 13,
    color: colors.greenMid,
    fontWeight: '500',
  },
  constitTable: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  constitRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 11,
    alignItems: 'center',
  },
  constitRowEven: {
    backgroundColor: colors.cream,
  },
  constitRowOdd: {
    backgroundColor: colors.creamMid,
  },
  constitRowLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.inkMuted,
    fontWeight: '500',
  },
  constitRowValue: {
    fontSize: 13,
    color: colors.ink,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
    paddingLeft: 12,
  },

  // Portfolio allocation
  allocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  allocLabel: {
    width: 90,
    fontSize: 12,
    color: colors.inkMuted,
  },
  allocBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.creamDark,
    borderRadius: 3,
    overflow: 'hidden',
  },
  allocBarFill: {
    height: '100%',
    backgroundColor: colors.green,
    borderRadius: 3,
  },
  allocPct: {
    width: 32,
    fontSize: 12,
    fontWeight: '600',
    color: colors.green,
    textAlign: 'right',
  },

  // Draft modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 26, 20, 0.55)',
    justifyContent: 'flex-end',
  },
  modalKAV: {
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
  },
  modalFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 14,
  },
  modalInput: {
    backgroundColor: colors.creamMid,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  modalTextarea: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 11,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalCancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.rule,
    borderRadius: 10,
    paddingVertical: 13,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.inkMuted,
  },
  modalSubmitBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green,
    borderRadius: 10,
    paddingVertical: 13,
  },
  modalSubmitBtnDisabled: {
    backgroundColor: colors.creamDark,
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.cream,
  },
})

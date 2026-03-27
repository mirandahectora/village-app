import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors, fonts } from '../theme'
import { useAuth, EXPLORE_VILLAGES } from '../context/AuthContext'
import { STRUCTURE_LABELS } from '../constants/financial'

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const MATCHED_PEOPLE = [
  {
    id: 'p1',
    initials: 'SC',
    name: 'Sofia C.',
    handle: '@sofia_c',
    goal: 'Education Debt',
    location: 'New Haven, CT',
    match: 96,
    photo: 'https://randomuser.me/api/portraits/women/66.jpg',
    headline:
      'Grad student making a real dent in federal loans. Consistent saver, finally seeing progress.',
  },
  {
    id: 'p2',
    initials: 'JA',
    name: 'Jordan A.',
    handle: '@jordan_a',
    goal: 'Education Debt',
    location: 'NYC, NY',
    match: 91,
    photo: 'https://randomuser.me/api/portraits/men/21.jpg',
    headline:
      'On income-driven repayment and paying down debt with intention. Slowly but surely.',
  },
  {
    id: 'p3',
    initials: 'LM',
    name: 'Lena M.',
    handle: '@lena.m',
    goal: 'Emergency Fund',
    location: 'Brooklyn, NY',
    match: 84,
    photo: 'https://randomuser.me/api/portraits/women/22.jpg',
    headline:
      'Freelancer learning to build stability on a variable income. Six months saved is the goal.',
  },
  {
    id: 'p4',
    initials: 'TP',
    name: 'Theo P.',
    handle: '@theo_p',
    goal: 'Education Debt',
    location: 'Boston, MA',
    match: 82,
    photo: 'https://randomuser.me/api/portraits/men/33.jpg',
    headline:
      'Recent grad navigating private loans on an entry-level salary. Chipping away every month.',
  },
  {
    id: 'p5',
    initials: 'MO',
    name: 'Maya O.',
    handle: '@maya.o',
    goal: 'Home Purchase',
    location: 'NYC, NY',
    match: 74,
    photo: 'https://randomuser.me/api/portraits/women/34.jpg',
    headline:
      "Dual income, one big dream. We're saving for our first home in NYC and not giving up.",
  },
  {
    id: 'p6',
    initials: 'RS',
    name: 'Ravi S.',
    handle: '@ravi_s',
    goal: 'Education Debt',
    location: 'New Haven, CT',
    match: 71,
    photo: 'https://randomuser.me/api/portraits/men/45.jpg',
    headline:
      'PhD researcher making the most of a stipend. Low debt, long horizon, building toward something.',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPooled(amount) {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}k`
  }
  return `$${amount}`
}

function resolveLabel(category, key) {
  const map = STRUCTURE_LABELS[category]
  if (!map) return key
  return map[key] || key
}

// ---------------------------------------------------------------------------
// InviteCodeModal
// ---------------------------------------------------------------------------

function InviteCodeModal({ visible, onClose }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const INVITE_REGEX = /^VLG-[A-Z0-9]{4}-[A-Z0-9]{4}$/

  function handleSubmit() {
    const trimmed = code.trim().toUpperCase()
    if (!INVITE_REGEX.test(trimmed)) {
      setError('Enter a valid code in the format VLG-XXXX-XXXX.')
      return
    }
    setError('')
    setSuccess(true)
  }

  function handleClose() {
    setCode('')
    setError('')
    setSuccess(false)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Join with Invite Code</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x-circle" size={22} color={colors.inkMuted} />
            </TouchableOpacity>
          </View>

          {success ? (
            <View style={styles.modalSuccessBox}>
              <Feather name="check" size={32} color={colors.green} />
              <Text style={styles.modalSuccessTitle}>Request Sent!</Text>
              <Text style={styles.modalSuccessBody}>
                Your request to join has been submitted. The village founders will review it shortly.
              </Text>
              <TouchableOpacity style={styles.btnTerracotta} onPress={handleClose}>
                <Text style={styles.btnTerracottaText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.modalBody}>
                If a village member shared a private invite link with you, enter the code below.
              </Text>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="VLG-XXXX-XXXX"
                placeholderTextColor={colors.inkMuted}
                value={code}
                onChangeText={(t) => {
                  setCode(t)
                  if (error) setError('')
                }}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.btnGhost} onPress={handleClose}>
                  <Text style={styles.btnGhostText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnTerracotta} onPress={handleSubmit}>
                  <Text style={styles.btnTerracottaText}>Submit Code</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// JoinModal — shows constitution table + message input
// ---------------------------------------------------------------------------

function JoinModal({ visible, village, onClose, onConfirm }) {
  const [message, setMessage] = useState('')

  function handleConfirm() {
    onConfirm(village, message.trim())
    setMessage('')
    onClose()
  }

  function handleClose() {
    setMessage('')
    onClose()
  }

  if (!village) return null

  const constitutionRows = village.structure
    ? [
        { label: 'Account Type', value: resolveLabel('accountType', village.structure.accountType) },
        { label: 'Pay-In Frequency', value: resolveLabel('payInFrequency', village.structure.payInFrequency) },
        { label: 'Payout Structure', value: resolveLabel('payoutStructure', village.structure.payoutStructure) },
        { label: 'Min. Contribution', value: `$${village.structure.minContribution}/mo` },
        { label: 'Pool Target', value: `$${(village.structure.poolTarget / 1000).toFixed(0)}k` },
        { label: 'Amendment Threshold', value: resolveLabel('amendmentThreshold', village.structure.amendmentThreshold) },
        { label: 'Quorum', value: resolveLabel('quorum', village.structure.quorum) },
        { label: 'Late Payment Policy', value: resolveLabel('latePaymentPolicy', village.structure.latePaymentPolicy) },
        { label: 'Probation Period', value: resolveLabel('probationPeriod', village.structure.probationPeriod) },
        { label: 'Exit Notice', value: resolveLabel('exitNoticePeriod', village.structure.exitNoticePeriod) },
        { label: 'Dishonorable Exit', value: resolveLabel('dishonorableExit', village.structure.dishonorableExit) },
        { label: 'Member Admission', value: resolveLabel('memberAdmission', village.structure.memberAdmission) },
      ]
    : []

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, styles.joinModalCard]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              Request to Join
            </Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x-circle" size={22} color={colors.inkMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.joinModalVillageName}>{village.name}</Text>

          <ScrollView
            style={styles.joinModalScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Constitution table */}
            <Text style={styles.sectionLabel}>Village Constitution</Text>
            <View style={styles.constitutionTable}>
              {constitutionRows.map((row, idx) => (
                <View
                  key={row.label}
                  style={[
                    styles.constitutionRow,
                    idx < constitutionRows.length - 1 && styles.constitutionRowBorder,
                  ]}
                >
                  <Text style={styles.constitutionKey}>{row.label}</Text>
                  <Text style={styles.constitutionVal}>{row.value}</Text>
                </View>
              ))}
            </View>

            {/* Optional message */}
            <Text style={styles.sectionLabel}>Message to Founders (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Introduce yourself and share why you want to join…"
              placeholderTextColor={colors.inkMuted}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnGhost} onPress={handleClose}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnTerracotta} onPress={handleConfirm}>
                <Text style={styles.btnTerracottaText}>Send Request</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom spacing for scroll */}
            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// ExploreVillageCard
// ---------------------------------------------------------------------------

function ExploreVillageCard({ village, isMember, canJoin, onRequestJoin }) {
  return (
    <View style={styles.card}>
      {/* Top row: photo + info */}
      <View style={styles.cardTopRow}>
        {village.photo ? (
          <Image source={{ uri: village.photo }} style={styles.villagePhoto} />
        ) : (
          <View style={[styles.villagePhoto, styles.initialsCircle]}>
            <Text style={styles.initialsText}>
              {village.name.slice(0, 2).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.cardTopInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {village.name}
          </Text>
          <Text style={styles.cardHandle}>{village.handle}</Text>
          <View style={styles.locationRow}>
            <Feather name="link" size={12} color={colors.inkMuted} />
            <Text style={styles.locationText}>{village.location}</Text>
          </View>
        </View>

        {/* Match badge */}
        <View style={styles.matchBadge}>
          <Feather name="zap" size={11} color={colors.green} />
          <Text style={styles.matchText}>{village.match}%</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statLabel}>Pool</Text>
          <Text style={styles.statValue}>{formatPooled(village.pooled)}</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statLabel}>Members</Text>
          <Text style={styles.statValue}>
            {village.members}/{village.maxMembers}
          </Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statLabel}>Goal</Text>
          <Text style={styles.statValue} numberOfLines={1}>
            {village.goal}
          </Text>
        </View>
      </View>

      {/* Headline */}
      <Text style={styles.cardHeadline}>{village.headline}</Text>

      {/* Action */}
      {isMember ? (
        <View style={styles.memberBadgeRow}>
          <Feather name="check" size={14} color={colors.green} />
          <Text style={styles.memberBadgeText}>Member</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.btnTerracotta, styles.cardBtn, !canJoin && styles.btnDisabled]}
          onPress={canJoin ? () => onRequestJoin(village) : null}
          disabled={!canJoin}
        >
          <Text style={styles.btnTerracottaText}>
            {canJoin ? 'Request to Join' : 'Village Full'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

// ---------------------------------------------------------------------------
// PersonCard
// ---------------------------------------------------------------------------

function PersonCard({ person, onConnect }) {
  return (
    <View style={[styles.card, styles.personCard]}>
      {/* Photo */}
      <View style={styles.personPhotoWrap}>
        {person.photo ? (
          <Image source={{ uri: person.photo }} style={styles.personPhoto} />
        ) : (
          <View style={[styles.personPhoto, styles.initialsCircle]}>
            <Text style={styles.initialsText}>{person.initials}</Text>
          </View>
        )}
      </View>

      {/* Name / handle / location */}
      <Text style={styles.personName}>{person.name}</Text>
      <Text style={styles.personHandle}>{person.handle}</Text>
      <View style={[styles.locationRow, styles.centered]}>
        <Feather name="link" size={12} color={colors.inkMuted} />
        <Text style={styles.locationText}>{person.location}</Text>
      </View>

      {/* Match badge */}
      <View style={[styles.matchBadge, styles.matchBadgeCentered]}>
        <Feather name="zap" size={11} color={colors.green} />
        <Text style={styles.matchText}>{person.match}% match</Text>
      </View>

      {/* Goal tag */}
      <View style={styles.goalTag}>
        <Text style={styles.goalTagText}>{person.goal}</Text>
      </View>

      {/* Headline */}
      <Text style={[styles.cardHeadline, styles.personHeadline]}>
        {person.headline}
      </Text>

      {/* Connect button */}
      <TouchableOpacity
        style={[styles.btnTerracotta, styles.cardBtn]}
        onPress={() => onConnect(person)}
      >
        <Text style={styles.btnTerracottaText}>Connect</Text>
      </TouchableOpacity>
    </View>
  )
}

// ---------------------------------------------------------------------------
// VillagesTab
// ---------------------------------------------------------------------------

function VillagesTab() {
  const { villages, joinVillage } = useAuth()
  const [query, setQuery] = useState('')
  const [inviteModalVisible, setInviteModalVisible] = useState(false)
  const [joinTarget, setJoinTarget] = useState(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return EXPLORE_VILLAGES
    return EXPLORE_VILLAGES.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.handle.toLowerCase().includes(q) ||
        v.goal.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.headline.toLowerCase().includes(q),
    )
  }, [query])

  const memberIds = useMemo(() => new Set(villages.map((v) => v.id)), [villages])

  function handleRequestJoin(village) {
    if (villages.length >= 2) return
    setJoinTarget(village)
  }

  function handleConfirmJoin(village, message) {
    joinVillage(village, message)
  }

  function renderItem({ item }) {
    const isMember = memberIds.has(item.id)
    const canJoin = !isMember && villages.length < 2 && item.members < item.maxMembers
    return (
      <ExploreVillageCard
        village={item}
        isMember={isMember}
        canJoin={canJoin}
        onRequestJoin={handleRequestJoin}
      />
    )
  }

  return (
    <View style={styles.tabContent}>
      {/* Search + Invite Code row */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={colors.inkMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search villages…"
            placeholderTextColor={colors.inkMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x-circle" size={16} color={colors.inkMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.inviteCodeBtn}
        onPress={() => setInviteModalVisible(true)}
      >
        <Feather name="arrow-right" size={15} color={colors.green} />
        <Text style={styles.inviteCodeBtnText}>Join with Invite Code</Text>
      </TouchableOpacity>

      {villages.length >= 2 && (
        <View style={styles.limitBanner}>
          <Feather name="users" size={14} color={colors.inkMuted} />
          <Text style={styles.limitBannerText}>
            You're in 2 villages. Leave one to join another.
          </Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Feather name="compass" size={28} color={colors.rule} />
            <Text style={styles.emptyText}>No villages match your search.</Text>
          </View>
        }
      />

      <InviteCodeModal
        visible={inviteModalVisible}
        onClose={() => setInviteModalVisible(false)}
      />

      <JoinModal
        visible={joinTarget !== null}
        village={joinTarget}
        onClose={() => setJoinTarget(null)}
        onConfirm={handleConfirmJoin}
      />
    </View>
  )
}

// ---------------------------------------------------------------------------
// PeopleTab
// ---------------------------------------------------------------------------

function PeopleTab({ onStartDM }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return MATCHED_PEOPLE
    return MATCHED_PEOPLE.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q) ||
        p.goal.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.headline.toLowerCase().includes(q),
    )
  }, [query])

  function renderItem({ item }) {
    return <PersonCard person={item} onConnect={onStartDM} />
  }

  return (
    <View style={styles.tabContent}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={colors.inkMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search people…"
            placeholderTextColor={colors.inkMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x-circle" size={16} color={colors.inkMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Feather name="users" size={28} color={colors.rule} />
            <Text style={styles.emptyText}>No people match your search.</Text>
          </View>
        }
      />
    </View>
  )
}

// ---------------------------------------------------------------------------
// ExploreView — root screen
// ---------------------------------------------------------------------------

export default function ExploreView({ onStartDM }) {
  const [activeTab, setActiveTab] = useState('villages')

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Screen header */}
        <View style={styles.screenHeader}>
          <Feather name="compass" size={20} color={colors.green} />
          <Text style={styles.screenTitle}>Explore</Text>
        </View>

        {/* Sub-tab bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBarItem, activeTab === 'villages' && styles.tabBarItemActive]}
            onPress={() => setActiveTab('villages')}
          >
            <Feather
              name="users"
              size={14}
              color={activeTab === 'villages' ? colors.green : colors.inkMuted}
            />
            <Text
              style={[
                styles.tabBarLabel,
                activeTab === 'villages' && styles.tabBarLabelActive,
              ]}
            >
              Villages
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBarItem, activeTab === 'people' && styles.tabBarItemActive]}
            onPress={() => setActiveTab('people')}
          >
            <Feather
              name="zap"
              size={14}
              color={activeTab === 'people' ? colors.green : colors.inkMuted}
            />
            <Text
              style={[
                styles.tabBarLabel,
                activeTab === 'people' && styles.tabBarLabelActive,
              ]}
            >
              People
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'villages' ? (
          <VillagesTab />
        ) : (
          <PeopleTab onStartDM={onStartDM} />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Layout
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  flex: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },

  // Screen header
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  screenTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.ink,
    fontWeight: '600',
  },

  // Sub-tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.creamMid,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 4,
    borderRadius: 10,
    padding: 3,
  },
  tabBarItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabBarItemActive: {
    backgroundColor: colors.cream,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBarLabel: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.inkMuted,
    fontWeight: '500',
  },
  tabBarLabelActive: {
    color: colors.green,
    fontWeight: '600',
  },

  // Search
  searchRow: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.creamMid,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.rule,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  searchIcon: {
    marginRight: 2,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
    padding: 0,
    margin: 0,
  },

  // Invite code button
  inviteCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.green,
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
  },
  inviteCodeBtnText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.green,
    fontWeight: '600',
  },

  // Limit banner
  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.creamDark,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  limitBannerText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkMuted,
    flex: 1,
  },

  // FlatList
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 4,
    gap: 14,
  },

  // Empty state
  emptyBox: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 12,
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.inkMuted,
  },

  // Card shared
  card: {
    backgroundColor: colors.creamMid,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.rule,
    padding: 16,
  },

  // Village card
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  villagePhoto: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  cardTopInfo: {
    flex: 1,
  },
  cardName: {
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.ink,
    fontWeight: '700',
    marginBottom: 1,
  },
  cardHandle: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.inkMuted,
    marginBottom: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkMuted,
  },

  // Match badge
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1.5,
    borderColor: colors.green,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 7,
  },
  matchText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.green,
    fontWeight: '700',
  },
  matchBadgeCentered: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  statChip: {
    flex: 1,
    backgroundColor: colors.creamDark,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.ink,
    fontWeight: '700',
  },

  // Card headline
  cardHeadline: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 19,
    marginBottom: 12,
  },

  // Card button area
  cardBtn: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  memberBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
  },
  memberBadgeText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.green,
    fontWeight: '700',
  },

  // Person card
  personCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  personPhotoWrap: {
    marginBottom: 10,
  },
  personPhoto: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  personName: {
    fontFamily: fonts.sans,
    fontSize: 17,
    color: colors.ink,
    fontWeight: '700',
    marginBottom: 2,
  },
  personHandle: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.inkMuted,
    marginBottom: 4,
  },
  centered: {
    justifyContent: 'center',
  },
  goalTag: {
    backgroundColor: colors.creamDark,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 4,
    marginBottom: 10,
  },
  goalTagText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkMuted,
    fontWeight: '600',
  },
  personHeadline: {
    textAlign: 'center',
    marginBottom: 14,
  },

  // Initials fallback
  initialsCircle: {
    backgroundColor: colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: fonts.sans,
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkMuted,
  },

  // Shared buttons
  btnTerracotta: {
    backgroundColor: colors.terracotta,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 20,
  },
  btnTerracottaText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  btnGhost: {
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.rule,
  },
  btnGhostText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.inkMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  btnDisabled: {
    backgroundColor: colors.rule,
    opacity: 0.7,
  },

  // Shared input
  input: {
    backgroundColor: colors.cream,
    borderWidth: 1.5,
    borderColor: colors.rule,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
    marginBottom: 6,
  },
  inputError: {
    borderColor: colors.terracotta,
  },
  textArea: {
    height: 100,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.terracotta,
    marginBottom: 10,
  },

  // Modal shared
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 26, 20, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.cream,
    borderRadius: 16,
    padding: 22,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  joinModalCard: {
    maxHeight: '85%',
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 22,
    paddingTop: 22,
  },
  modalTitle: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.ink,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  modalBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 20,
    marginBottom: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },

  // Modal success
  modalSuccessBox: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    gap: 10,
  },
  modalSuccessTitle: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.green,
    fontWeight: '700',
  },
  modalSuccessBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },

  // Join modal internals
  joinModalVillageName: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.inkMuted,
    fontWeight: '600',
    paddingHorizontal: 22,
    marginBottom: 14,
  },
  joinModalScroll: {
    paddingHorizontal: 22,
  },

  // Constitution table
  sectionLabel: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
    marginBottom: 8,
  },
  constitutionTable: {
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 18,
  },
  constitutionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: colors.creamMid,
  },
  constitutionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  constitutionKey: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkMuted,
    fontWeight: '600',
    width: 140,
    flexShrink: 0,
  },
  constitutionVal: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.ink,
    flex: 1,
    textAlign: 'right',
  },
})

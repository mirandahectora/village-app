import { useState } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  StyleSheet, Modal, TextInput,
} from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { colors } from '../theme'
import VillageView from './VillageView'
import ExploreView from './ExploreView'
import MessagesView from './MessagesView'
import SettingsView from './SettingsView'

const Tab = createBottomTabNavigator()

export default function DashboardScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.ink,
          borderTopColor: 'rgba(196,186,168,0.12)',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.cream,
        tabBarInactiveTintColor: 'rgba(244,238,226,0.45)',
        tabBarLabelStyle: {
          fontFamily: 'Courier New',
          fontSize: 10,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tab.Screen
        name="Villages"
        component={VillagesTab}
        options={{
          tabBarIcon: ({ color }) => <Feather name="home" size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreTab}
        options={{
          tabBarIcon: ({ color }) => <Feather name="compass" size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesTab}
        options={{
          tabBarIcon: ({ color, focused }) => <MessagesTabIcon color={color} />,
          tabBarBadge: undefined,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsTab}
        options={{
          tabBarIcon: ({ color }) => <Feather name="settings" size={20} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}

function MessagesTabIcon({ color }) {
  const { dms } = useAuth()
  return (
    <View>
      <Feather name="message-square" size={20} color={color} />
      {dms.length > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{dms.length}</Text>
        </View>
      )}
    </View>
  )
}

/* ── VILLAGES TAB ─────────────────────────────────── */
function VillagesTab() {
  const { user, villages, logout } = useAuth()
  const [activeVillageId, setActiveVillageId] = useState(villages?.[0]?.id || null)
  const [tab, setTab] = useState('overview')

  const currentVillage = villages?.find(v => v.id === activeVillageId)

  const handleLeave = () => {
    const remaining = villages.filter(v => v.id !== activeVillageId)
    setActiveVillageId(remaining[0]?.id || null)
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* User header */}
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          {user?.photo
            ? <Image source={{ uri: user.photo }} style={styles.userAvatar} />
            : <View style={styles.userAvatarFallback}><Text style={styles.userAvatarText}>{user?.avatar}</Text></View>
          }
          <View>
            <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
            <Text style={styles.userPriority}>{user?.priority || 'Village'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Feather name="log-out" size={18} color={colors.inkMuted} />
        </TouchableOpacity>
      </View>

      {/* Village selector */}
      {villages?.length > 0 ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.villageSelector}
          >
            {villages.map(v => {
              const pct = Math.round((v.pooled / v.target) * 100)
              const isActive = activeVillageId === v.id
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.villagePill, isActive && styles.villagePillActive]}
                  onPress={() => { setActiveVillageId(v.id); setTab('overview') }}
                >
                  {v.photo && (
                    <Image source={{ uri: v.photo }} style={styles.villagePillPhoto} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.villagePillName, isActive && styles.villagePillNameActive]} numberOfLines={1}>{v.name}</Text>
                    <Text style={styles.villagePillMeta}>{v.members} members · {pct}%</Text>
                    <View style={styles.villagePillBar}>
                      <View style={[styles.villagePillFill, { width: `${pct}%`, backgroundColor: v.color === 'green' ? colors.greenMid : colors.terracotta }]} />
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          {/* Village content */}
          {currentVillage && (
            <VillageView village={currentVillage} tab={tab} setTab={setTab} onLeave={handleLeave} />
          )}
        </>
      ) : (
        <NoVillagesState />
      )}
    </SafeAreaView>
  )
}

function NoVillagesState() {
  return (
    <View style={styles.noVillage}>
      <View style={styles.noVillageIcon}>
        <Feather name="plus" size={28} color={colors.inkMuted} />
      </View>
      <Text style={styles.noVillageTitle}>You're not in any villages yet.</Text>
      <Text style={styles.noVillageSub}>Browse the Explore tab to find a group aligned with your financial goals.</Text>
    </View>
  )
}

/* ── CREATE VILLAGE TAB (modal) ────────────────────── */
function CreateVillageModal({ visible, onClose, onCreated }) {
  const { user, setVillages } = useAuth()
  const [form, setForm] = useState({
    name: '', goal: 'Education Debt', location: '', description: '',
    accountType: 'hysa', payInFrequency: 'monthly', poolTarget: '',
    minContribution: '', payoutStructure: 'voted',
    amendmentThreshold: 'two_thirds', quorum: 'two_thirds',
    memberAdmission: 'vote_required', dishonorableExit: 'returned_no_interest',
    probationPeriod: '1_month', latePaymentPolicy: 'grace_7', exitNoticePeriod: '1_month',
  })
  const [submitted, setSubmitted] = useState(false)
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleCreate = () => {
    if (!form.name.trim()) return
    const newVillage = {
      id: `v-${Date.now()}`,
      name: form.name,
      goal: form.goal,
      goalType: form.goal.toLowerCase().replace(/ /g, '_'),
      location: form.location,
      headline: form.description,
      photo: null,
      members: 1,
      maxMembers: 20,
      pooled: 0,
      target: form.poolTarget ? Number(form.poolTarget) : 50000,
      myContribution: 0,
      nextContribution: 0,
      nextDate: 'Not set',
      intervalLabel: { monthly: 'Monthly', biweekly: 'Bi-weekly', weekly: 'Weekly' }[form.payInFrequency] || 'Monthly',
      color: 'green',
      founded: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      structure: {
        accountType: form.accountType,
        payInFrequency: form.payInFrequency,
        poolTarget: form.poolTarget ? Number(form.poolTarget) : null,
        minContribution: form.minContribution ? Number(form.minContribution) : null,
        payoutStructure: form.payoutStructure,
        amendmentThreshold: form.amendmentThreshold,
        quorum: form.quorum,
        memberAdmission: form.memberAdmission,
        dishonorableExit: form.dishonorableExit,
        probationPeriod: form.probationPeriod,
        latePaymentPolicy: form.latePaymentPolicy,
        exitNoticePeriod: form.exitNoticePeriod,
      },
      memberList: [{ id: 'me', initials: user?.avatar || '?', name: `${user?.first_name || ''} ${user?.last_name?.[0] || ''}.`, role: 'Founder', contrib: 0, status: 'active' }],
      recentActivity: [{ type: 'join', actor: `${user?.first_name || ''} ${user?.last_name || ''}`, amount: null, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), note: 'Village created' }],
      chat: [], votes: [], joinRequests: [],
    }
    setVillages(prev => [...prev, newVillage])
    setSubmitted(true)
    setTimeout(() => { setSubmitted(false); onCreated(); onClose() }, 1200)
  }

  const GOAL_OPTIONS = ['Education Debt', 'Emergency Fund', 'Home Purchase', 'Retirement', 'Small Business', 'Investment']

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.root}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalHeaderTitle}>Start a Village</Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={22} color={colors.ink} />
          </TouchableOpacity>
        </View>
        {submitted ? (
          <View style={styles.submittedState}>
            <Feather name="check-circle" size={36} color={colors.green} />
            <Text style={styles.submittedText}>Village created ✓</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Village name</Text>
              <TextInput style={styles.input} value={form.name} onChangeText={v => update('name', v)} placeholder="e.g. New Haven Savers" placeholderTextColor={colors.rule} />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Location (optional)</Text>
              <TextInput style={styles.input} value={form.location} onChangeText={v => update('location', v)} placeholder="City, State" placeholderTextColor={colors.rule} />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Description (optional)</Text>
              <TextInput style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]} value={form.description} onChangeText={v => update('description', v)} placeholder="What is this village working toward?" placeholderTextColor={colors.rule} multiline />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Pool size goal</Text>
              <TextInput style={styles.input} value={form.poolTarget} onChangeText={v => update('poolTarget', v)} placeholder="$50,000" placeholderTextColor={colors.rule} keyboardType="numeric" />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Min. contribution per period</Text>
              <TextInput style={styles.input} value={form.minContribution} onChangeText={v => update('minContribution', v)} placeholder="$100" placeholderTextColor={colors.rule} keyboardType="numeric" />
            </View>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleCreate}>
              <Text style={styles.btnPrimaryText}>Create Village</Text>
              <Feather name="arrow-right" size={14} color={colors.cream} />
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  )
}

/* ── OTHER TABS (wrappers) ─────────────────────────── */
function ExploreTab() {
  const { startDM } = useAuth()
  const [activeDMId, setActiveDMId] = useState(null)

  const handleStartDM = (person) => {
    startDM(person)
    setActiveDMId(person.id)
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ExploreView onStartDM={handleStartDM} />
    </SafeAreaView>
  )
}

function MessagesTab() {
  const [activeDMId, setActiveDMId] = useState(null)

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <MessagesView activeDMId={activeDMId} setActiveDMId={setActiveDMId} />
    </SafeAreaView>
  )
}

function SettingsTab() {
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <SettingsView />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  // User header
  userHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.rule,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  userAvatar: { width: 34, height: 34, borderRadius: 17 },
  userAvatarFallback: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { fontFamily: 'Courier New', fontSize: 11, color: colors.cream, fontWeight: '600' },
  userName: { fontFamily: 'System', fontSize: 14, fontWeight: '500', color: colors.ink },
  userPriority: { fontFamily: 'Courier New', fontSize: 10, letterSpacing: 0.5, color: colors.inkMuted },
  logoutBtn: { padding: 4 },
  // Village selector
  villageSelector: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  villagePill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: colors.rule, borderRadius: 2,
    minWidth: 180, maxWidth: 240,
    backgroundColor: 'transparent',
  },
  villagePillActive: { backgroundColor: 'rgba(42,74,30,0.06)', borderColor: colors.green },
  villagePillPhoto: { width: 24, height: 24, borderRadius: 12, flexShrink: 0 },
  villagePillName: { fontFamily: 'System', fontSize: 13, color: colors.ink },
  villagePillNameActive: { fontWeight: '600', color: colors.green },
  villagePillMeta: { fontFamily: 'Courier New', fontSize: 10, color: colors.inkMuted, marginTop: 2 },
  villagePillBar: { height: 2, backgroundColor: colors.creamDark, borderRadius: 1, marginTop: 4 },
  villagePillFill: { height: '100%', borderRadius: 1 },
  // No villages
  noVillage: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  noVillageIcon: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: colors.rule, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  noVillageTitle: { fontFamily: 'Georgia', fontSize: 22, fontWeight: '700', color: colors.ink, textAlign: 'center', marginBottom: 12 },
  noVillageSub: { fontFamily: 'System', fontSize: 14, color: colors.inkMuted, textAlign: 'center', lineHeight: 22, maxWidth: 320 },
  // Badge
  badge: { position: 'absolute', top: -4, right: -6, backgroundColor: colors.green, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { fontFamily: 'Courier New', fontSize: 9, color: colors.cream, fontWeight: '700' },
  // Create modal
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.rule },
  modalHeaderTitle: { fontFamily: 'Georgia', fontSize: 20, fontWeight: '700', color: colors.ink },
  submittedState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  submittedText: { fontFamily: 'Courier New', fontSize: 14, color: colors.green, letterSpacing: 0.5 },
  // Shared
  fieldGroup: { marginBottom: 18 },
  label: { fontFamily: 'Courier New', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkMuted, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.rule, borderRadius: 2, padding: 14, fontFamily: 'System', fontSize: 15, color: colors.ink, backgroundColor: 'transparent' },
  btnPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.green, borderRadius: 2, paddingVertical: 16, paddingHorizontal: 24, marginTop: 8 },
  btnPrimaryText: { fontFamily: 'Courier New', fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.cream, fontWeight: '600' },
})

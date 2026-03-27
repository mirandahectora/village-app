import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
  Modal,
  Image,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors, fonts } from '../theme'
import { useAuth } from '../context/AuthContext'
import { INCOME_VARS, DEBT_VARS, ASSET_VARS, MOCK_BANKS } from '../constants/financial'

// ─── Utility ────────────────────────────────────────────────────────────────

function formatAmount(n) {
  if (n == null || isNaN(Number(n))) return '$0'
  return '$' + Number(n).toLocaleString('en-US')
}

function lookupLabel(vars, key) {
  const found = vars.find((v) => v.key === key)
  return found ? found.label : key
}

// ─── Top Tab Bar ─────────────────────────────────────────────────────────────

const TABS = [
  { key: 'profile',       label: 'Profile',       icon: 'user' },
  { key: 'financial',     label: 'Financial',     icon: 'dollar-sign' },
  { key: 'accounts',      label: 'Accounts',      icon: 'home' },
  { key: 'notifications', label: 'Notifications', icon: 'bell' },
  { key: 'security',      label: 'Security',      icon: 'shield' },
]

function TabBar({ activeTab, onSelect }) {
  return (
    <View style={styles.tabBarWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, active && styles.tabItemActive]}
              onPress={() => onSelect(tab.key)}
              activeOpacity={0.7}
            >
              <Feather
                name={tab.icon}
                size={14}
                color={active ? colors.green : colors.inkMuted}
                style={{ marginRight: 5 }}
              />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function SectionHeading({ title }) {
  return <Text style={styles.sectionHeading}>{title}</Text>
}

function FieldLabel({ label }) {
  return <Text style={styles.fieldLabel}>{label}</Text>
}

function StyledInput({ value, onChangeText, placeholder, multiline, minHeight, secureTextEntry, keyboardType }) {
  return (
    <TextInput
      style={[styles.input, multiline && { minHeight: minHeight || 80, textAlignVertical: 'top' }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.rule}
      multiline={multiline}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCorrect={false}
    />
  )
}

function SaveButton({ onPress, saved }) {
  return (
    <TouchableOpacity
      style={[styles.saveButton, saved && styles.saveButtonSaved]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {saved ? (
        <View style={styles.saveButtonInner}>
          <Feather name="check" size={15} color={colors.cream} style={{ marginRight: 6 }} />
          <Text style={styles.saveButtonText}>Saved</Text>
        </View>
      ) : (
        <View style={styles.saveButtonInner}>
          <Feather name="save" size={15} color={colors.cream} style={{ marginRight: 6 }} />
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

function Divider() {
  return <View style={styles.divider} />
}

// ─── Profile Section ─────────────────────────────────────────────────────────

function ProfileSection() {
  const { user } = useAuth()

  const [firstName,  setFirstName]  = useState(user?.first_name  || '')
  const [lastName,   setLastName]   = useState(user?.last_name   || '')
  const [email,      setEmail]      = useState(user?.email       || '')
  const [phone,      setPhone]      = useState(user?.phone       || '')
  const [location,   setLocation]   = useState(user?.location    || '')
  const [handle,     setHandle]     = useState(user?.handle      || '')
  const [headline,   setHeadline]   = useState(user?.headline    || '')
  const [saved,      setSaved]      = useState(false)

  const handleSave = useCallback(() => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [])

  const initials = user?.avatar || ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase()

  return (
    <View style={styles.sectionContainer}>
      {/* Avatar */}
      <View style={styles.avatarRow}>
        <View style={styles.avatarWrap}>
          {user?.photo ? (
            <Image source={{ uri: user.photo }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.cameraOverlay} activeOpacity={0.8}>
            <Feather name="camera" size={14} color={colors.cream} />
          </TouchableOpacity>
        </View>
        <View style={styles.avatarMeta}>
          <Text style={styles.avatarName}>{firstName} {lastName}</Text>
          <Text style={styles.avatarHandle}>{handle}</Text>
        </View>
      </View>

      <Divider />

      <SectionHeading title="Basic Info" />

      <View style={styles.fieldRow}>
        <View style={styles.fieldHalf}>
          <FieldLabel label="First Name" />
          <StyledInput value={firstName} onChangeText={setFirstName} placeholder="First name" />
        </View>
        <View style={[styles.fieldHalf, { marginLeft: 10 }]}>
          <FieldLabel label="Last Name" />
          <StyledInput value={lastName} onChangeText={setLastName} placeholder="Last name" />
        </View>
      </View>

      <FieldLabel label="Email" />
      <StyledInput value={email} onChangeText={setEmail} placeholder="Email address" keyboardType="email-address" />

      <FieldLabel label="Phone" />
      <StyledInput value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" />

      <FieldLabel label="Location" />
      <StyledInput value={location} onChangeText={setLocation} placeholder="City, State" />

      <FieldLabel label="Handle" />
      <StyledInput value={handle} onChangeText={setHandle} placeholder="@yourhandle" />

      <Divider />

      <SectionHeading title="Headline" />
      <FieldLabel label="A short bio visible to village members" />
      <StyledInput
        value={headline}
        onChangeText={setHeadline}
        placeholder="Tell your village something about you..."
        multiline
        minHeight={80}
      />

      <SaveButton onPress={handleSave} saved={saved} />
    </View>
  )
}

// ─── Financial Add Modal ──────────────────────────────────────────────────────

function AddFinancialModal({ visible, onClose, onSave, vars, title }) {
  const [pickerVisible, setPickerVisible] = useState(false)
  const [selectedKey,   setSelectedKey]   = useState(null)
  const [selectedLabel, setSelectedLabel] = useState('')
  const [amount,        setAmount]        = useState('')

  const selectedVar = vars.find((v) => v.key === selectedKey)

  const handleSave = () => {
    if (!selectedKey || !amount) return
    onSave({ key: selectedKey, amount: parseFloat(amount.replace(/,/g, '')) || 0 })
    setSelectedKey(null)
    setSelectedLabel('')
    setAmount('')
    onClose()
  }

  const handleClose = () => {
    setSelectedKey(null)
    setSelectedLabel('')
    setAmount('')
    setPickerVisible(false)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add {title}</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={20} color={colors.inkMuted} />
            </TouchableOpacity>
          </View>

          <FieldLabel label="Type" />
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setPickerVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.pickerButtonText, !selectedLabel && { color: colors.rule }]}>
              {selectedLabel || 'Select a type...'}
            </Text>
            <Feather name="search" size={15} color={colors.inkMuted} />
          </TouchableOpacity>

          <FieldLabel label="Amount ($)" />
          <StyledInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={[styles.saveButton, (!selectedKey || !amount) && styles.saveButtonDisabled]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Nested picker modal */}
      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '70%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Type</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x" size={20} color={colors.inkMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {vars.map((v) => (
                <TouchableOpacity
                  key={v.key}
                  style={[styles.pickerOptionRow, selectedKey === v.key && styles.pickerOptionRowSelected]}
                  onPress={() => {
                    setSelectedKey(v.key)
                    setSelectedLabel(v.label)
                    setPickerVisible(false)
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pickerOptionText, selectedKey === v.key && styles.pickerOptionTextSelected]}>
                    {v.label}
                  </Text>
                  {selectedKey === v.key && (
                    <Feather name="check" size={15} color={colors.green} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  )
}

// ─── Financial Sub-Section ────────────────────────────────────────────────────

function FinancialSubSection({ title, items, vars, onAdd, onRemove }) {
  const total = items.reduce((sum, item) => sum + (item.amount || 0), 0)

  return (
    <View style={styles.financialSubSection}>
      <View style={styles.financialSubHeader}>
        <Text style={styles.financialSubTitle}>{title}</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAdd} activeOpacity={0.8}>
          <Feather name="plus" size={13} color={colors.cream} style={{ marginRight: 4 }} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 && (
        <Text style={styles.emptyText}>No items yet. Tap Add to get started.</Text>
      )}

      {items.map((item, idx) => (
        <View key={`${item.key}-${idx}`} style={styles.financialItem}>
          <View style={styles.financialItemLeft}>
            <Text style={styles.financialItemLabel}>{lookupLabel(vars, item.key)}</Text>
            <Text style={styles.financialItemAmount}>{formatAmount(item.amount)}</Text>
          </View>
          <TouchableOpacity
            onPress={() => onRemove(idx)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.removeButton}
          >
            <Feather name="x" size={15} color={colors.terracotta} />
          </TouchableOpacity>
        </View>
      ))}

      {items.length > 0 && (
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{formatAmount(total)}</Text>
        </View>
      )}
    </View>
  )
}

// ─── Financial Section ────────────────────────────────────────────────────────

function FinancialSection() {
  const { user, updateFinancial } = useAuth()

  const [income, setIncome] = useState(user?.financial?.income  || [])
  const [debts,  setDebts]  = useState(user?.financial?.debts   || [])
  const [assets, setAssets] = useState(user?.financial?.assets  || [])

  const [incomeModalOpen, setIncomeModalOpen] = useState(false)
  const [debtModalOpen,   setDebtModalOpen]   = useState(false)
  const [assetModalOpen,  setAssetModalOpen]  = useState(false)

  const addItem = (list, setList, newItem) => {
    const updated = [...list, newItem]
    setList(updated)
  }

  const removeItem = (list, setList, idx) => {
    const updated = list.filter((_, i) => i !== idx)
    setList(updated)
  }

  return (
    <View style={styles.sectionContainer}>
      <SectionHeading title="Financial Data" />
      <Text style={styles.sectionDescription}>
        This information is private and used to calculate your village contribution capacity.
      </Text>

      <FinancialSubSection
        title="Income Sources"
        items={income}
        vars={INCOME_VARS}
        onAdd={() => setIncomeModalOpen(true)}
        onRemove={(idx) => removeItem(income, setIncome, idx)}
      />

      <Divider />

      <FinancialSubSection
        title="Debt Obligations"
        items={debts}
        vars={DEBT_VARS}
        onAdd={() => setDebtModalOpen(true)}
        onRemove={(idx) => removeItem(debts, setDebts, idx)}
      />

      <Divider />

      <FinancialSubSection
        title="Assets"
        items={assets}
        vars={ASSET_VARS}
        onAdd={() => setAssetModalOpen(true)}
        onRemove={(idx) => removeItem(assets, setAssets, idx)}
      />

      <AddFinancialModal
        visible={incomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        onSave={(item) => addItem(income, setIncome, item)}
        vars={INCOME_VARS}
        title="Income Source"
      />
      <AddFinancialModal
        visible={debtModalOpen}
        onClose={() => setDebtModalOpen(false)}
        onSave={(item) => addItem(debts, setDebts, item)}
        vars={DEBT_VARS}
        title="Debt Obligation"
      />
      <AddFinancialModal
        visible={assetModalOpen}
        onClose={() => setAssetModalOpen(false)}
        onSave={(item) => addItem(assets, setAssets, item)}
        vars={ASSET_VARS}
        title="Asset"
      />
    </View>
  )
}

// ─── Accounts Section ─────────────────────────────────────────────────────────

const DEMO_ACCOUNTS = [
  { id: 'acc1', bank: 'Chase', last4: '4821', type: 'Checking' },
  { id: 'acc2', bank: 'Ally Bank', last4: '2203', type: 'HYSA' },
]

function LinkAccountModal({ visible, onClose }) {
  const [query, setQuery] = useState('')

  const filtered = MOCK_BANKS.filter((b) =>
    b.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { maxHeight: '70%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Link Bank Account</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={20} color={colors.inkMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrap}>
            <Feather name="search" size={15} color={colors.inkMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search banks..."
              placeholderTextColor={colors.rule}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {filtered.map((bank) => (
              <TouchableOpacity
                key={bank}
                style={styles.bankRow}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <View style={styles.bankIconCircle}>
                  <Feather name="home" size={14} color={colors.inkMuted} />
                </View>
                <Text style={styles.bankName}>{bank}</Text>
                <Feather name="link" size={14} color={colors.green} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

function AccountsSection() {
  const [linkModalOpen, setLinkModalOpen] = useState(false)

  return (
    <View style={styles.sectionContainer}>
      <SectionHeading title="Connected Accounts" />
      <Text style={styles.sectionDescription}>
        Link bank accounts to enable automatic contribution tracking.
      </Text>

      {DEMO_ACCOUNTS.map((acct) => (
        <View key={acct.id} style={styles.accountCard}>
          <View style={styles.accountCardLeft}>
            <View style={styles.bankIconCircleLg}>
              <Feather name="home" size={18} color={colors.inkMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.accountName}>
                {acct.bank} {'\u00B7\u00B7\u00B7\u00B7'} {acct.last4}
              </Text>
              <Text style={styles.accountType}>{acct.type}</Text>
            </View>
          </View>
          <View style={styles.accountCardRight}>
            <View style={styles.connectedBadge}>
              <Feather name="check-circle" size={11} color={colors.green} style={{ marginRight: 4 }} />
              <Text style={styles.connectedBadgeText}>Connected</Text>
            </View>
            <TouchableOpacity style={styles.unlinkButton} activeOpacity={0.8}>
              <Text style={styles.unlinkButtonText}>Unlink</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => setLinkModalOpen(true)}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={15} color={colors.green} style={{ marginRight: 7 }} />
        <Text style={styles.linkButtonText}>Link New Account</Text>
      </TouchableOpacity>

      <LinkAccountModal visible={linkModalOpen} onClose={() => setLinkModalOpen(false)} />
    </View>
  )
}

// ─── Notifications Section ────────────────────────────────────────────────────

const NOTIFICATION_ITEMS = [
  { key: 'contrib_reminders',    label: 'Contribution reminders',   defaultOn: true },
  { key: 'vote_notifications',   label: 'Vote notifications',       defaultOn: true },
  { key: 'new_member_alerts',    label: 'New member alerts',        defaultOn: true },
  { key: 'village_chat_mentions', label: 'Village chat mentions',   defaultOn: false },
  { key: 'weekly_summary',       label: 'Weekly summary',           defaultOn: true },
  { key: 'marketing_emails',     label: 'Marketing emails',         defaultOn: false },
]

function NotificationsSection() {
  const initialState = NOTIFICATION_ITEMS.reduce((acc, item) => {
    acc[item.key] = item.defaultOn
    return acc
  }, {})
  const [toggles, setToggles] = useState(initialState)

  const toggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <View style={styles.sectionContainer}>
      <SectionHeading title="Notification Preferences" />
      <Text style={styles.sectionDescription}>
        Choose which notifications you receive from Village.
      </Text>

      {NOTIFICATION_ITEMS.map((item, idx) => (
        <View key={item.key}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{item.label}</Text>
            <Switch
              value={toggles[item.key]}
              onValueChange={() => toggle(item.key)}
              trackColor={{ false: colors.creamDark, true: colors.greenMid }}
              thumbColor={toggles[item.key] ? colors.cream : colors.inkMuted}
              ios_backgroundColor={colors.creamDark}
            />
          </View>
          {idx < NOTIFICATION_ITEMS.length - 1 && <Divider />}
        </View>
      ))}
    </View>
  )
}

// ─── Security Section ─────────────────────────────────────────────────────────

function SecuritySection() {
  const [currentPassword,  setCurrentPassword]  = useState('')
  const [newPassword,      setNewPassword]       = useState('')
  const [confirmPassword,  setConfirmPassword]   = useState('')
  const [twoFactor,        setTwoFactor]         = useState(false)
  const [saved,            setSaved]             = useState(false)

  const handleSavePassword = useCallback(() => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [])

  return (
    <View style={styles.sectionContainer}>
      <SectionHeading title="Change Password" />

      <FieldLabel label="Current Password" />
      <StyledInput
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Enter current password"
        secureTextEntry
      />

      <FieldLabel label="New Password" />
      <StyledInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Enter new password"
        secureTextEntry
      />

      <FieldLabel label="Confirm New Password" />
      <StyledInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm new password"
        secureTextEntry
      />

      <SaveButton onPress={handleSavePassword} saved={saved} />

      <Divider />

      <SectionHeading title="Two-Factor Authentication" />
      <View style={styles.toggleRow}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.toggleLabel}>Enable 2FA</Text>
          <Text style={styles.toggleSubLabel}>
            Add an extra layer of security to your account with a verification code on login.
          </Text>
        </View>
        <Switch
          value={twoFactor}
          onValueChange={setTwoFactor}
          trackColor={{ false: colors.creamDark, true: colors.greenMid }}
          thumbColor={twoFactor ? colors.cream : colors.inkMuted}
          ios_backgroundColor={colors.creamDark}
        />
      </View>

      <Divider />

      <SectionHeading title="Danger Zone" />
      <Text style={styles.sectionDescription}>
        Deleting your account is permanent and cannot be undone. All your village memberships and financial data will be removed.
      </Text>
      <TouchableOpacity style={styles.deleteButton} activeOpacity={0.8}>
        <Feather name="x" size={15} color={colors.cream} style={{ marginRight: 7 }} />
        <Text style={styles.deleteButtonText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  )
}

// ─── Main SettingsView ────────────────────────────────────────────────────────

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('profile')

  const renderSection = () => {
    switch (activeTab) {
      case 'profile':       return <ProfileSection />
      case 'financial':     return <FinancialSection />
      case 'accounts':      return <AccountsSection />
      case 'notifications': return <NotificationsSection />
      case 'security':      return <SecuritySection />
      default:              return <ProfileSection />
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Settings</Text>
      </View>

      <TabBar activeTab={activeTab} onSelect={setActiveTab} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderSection()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  // ── Screen header
  screenHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  screenTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.ink,
    fontWeight: '700',
  },

  // ── Tab bar
  tabBarWrapper: {
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  tabBarContent: {
    paddingHorizontal: 14,
    paddingVertical: 0,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 2,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: colors.green,
  },
  tabLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkMuted,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.green,
    fontWeight: '700',
  },

  // ── Scroll area
  scrollArea: {
    flex: 1,
    backgroundColor: colors.creamMid,
  },
  scrollContent: {
    paddingBottom: 48,
  },

  // ── Section container
  sectionContainer: {
    margin: 16,
    padding: 18,
    backgroundColor: colors.cream,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  sectionHeading: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.ink,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionDescription: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 19,
    marginBottom: 16,
    marginTop: -6,
  },

  // ── Field
  fieldLabel: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
    marginTop: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  fieldHalf: {
    flex: 1,
  },
  input: {
    backgroundColor: colors.creamMid,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 11 : 8,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
  },

  // ── Divider
  divider: {
    height: 1,
    backgroundColor: colors.rule,
    marginVertical: 16,
  },

  // ── Avatar
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrap: {
    position: 'relative',
    width: 68,
    height: 68,
    marginRight: 16,
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: colors.rule,
  },
  avatarFallback: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.rule,
  },
  avatarInitials: {
    fontFamily: fonts.sans,
    fontSize: 22,
    color: colors.cream,
    fontWeight: '700',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.cream,
  },
  avatarMeta: {
    flex: 1,
  },
  avatarName: {
    fontFamily: fonts.sans,
    fontSize: 17,
    color: colors.ink,
    fontWeight: '700',
  },
  avatarHandle: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 3,
  },

  // ── Save button
  saveButton: {
    backgroundColor: colors.green,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveButtonSaved: {
    backgroundColor: colors.greenMid,
  },
  saveButtonDisabled: {
    backgroundColor: colors.inkMuted,
    opacity: 0.5,
  },
  saveButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.cream,
    fontWeight: '700',
  },

  // ── Financial
  financialSubSection: {
    marginBottom: 4,
  },
  financialSubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  financialSubTitle: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  addButtonText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.cream,
    fontWeight: '600',
  },
  financialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.creamDark,
  },
  financialItemLeft: {
    flex: 1,
    marginRight: 8,
  },
  financialItemLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.ink,
    fontWeight: '500',
  },
  financialItemAmount: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 2,
  },
  totalLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkMuted,
    fontWeight: '700',
  },
  totalAmount: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.green,
    fontWeight: '700',
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkMuted,
    fontStyle: 'italic',
    paddingVertical: 10,
  },

  // ── Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28,26,20,0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: fonts.serif,
    fontSize: 17,
    color: colors.ink,
    fontWeight: '700',
  },

  // ── Picker
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.creamMid,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 4,
  },
  pickerButtonText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
    flex: 1,
    marginRight: 8,
  },
  pickerOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.creamDark,
  },
  pickerOptionRowSelected: {
    backgroundColor: colors.creamMid,
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  pickerOptionText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
    flex: 1,
  },
  pickerOptionTextSelected: {
    color: colors.green,
    fontWeight: '600',
  },

  // ── Accounts
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.creamMid,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 10,
    padding: 13,
    marginBottom: 10,
  },
  accountCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  bankIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  bankIconCircleLg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountCardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  accountName: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '600',
  },
  accountType: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F3E1',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
  },
  connectedBadgeText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.green,
    fontWeight: '600',
  },
  unlinkButton: {
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  unlinkButtonText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
    fontWeight: '500',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.green,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 6,
  },
  linkButtonText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.green,
    fontWeight: '700',
  },

  // ── Bank search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.creamMid,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
    padding: 0,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.creamDark,
  },
  bankName: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
    flex: 1,
    marginLeft: 2,
  },

  // ── Notifications
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  toggleLabel: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  toggleSubLabel: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 17,
    marginTop: 3,
  },

  // ── Security
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.terracotta,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  deleteButtonText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.cream,
    fontWeight: '700',
  },
})

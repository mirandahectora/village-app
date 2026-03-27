import { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Image,
  SafeAreaView, Modal, FlatList,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { colors } from '../theme'
import { INCOME_VARS, DEBT_VARS, ASSET_VARS, GOAL_OPTIONS, MOCK_BANKS } from '../constants/financial'

const STEPS = [
  { id: 1, label: 'Account',  title: 'Create your account' },
  { id: 2, label: 'Profile',  title: 'Your profile' },
  { id: 3, label: 'Income',   title: 'Income sources' },
  { id: 4, label: 'Debts',    title: 'Debt obligations' },
  { id: 5, label: 'Assets',   title: 'Assets & net worth' },
  { id: 6, label: 'Bank',     title: 'Connect your bank' },
  { id: 7, label: 'Done',     title: "You're all set" },
]

export default function AuthScreen() {
  const { login, signup } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    email: '', password: '', showPassword: false,
    first_name: '', last_name: '', phone: '', location: '', goal: GOAL_OPTIONS[0],
    income: [], debts: [], assets: [],
    bank: null,
  })

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleLogin = () => {
    login(form.email, form.password)
  }

  const handleSignupFinish = () => {
    signup({
      first_name: form.first_name,
      last_name:  form.last_name,
      email:      form.email,
      phone:      form.phone,
      income:     form.income,
      debts:      form.debts,
      assets:     form.assets,
    })
  }

  const handleNext = () => {
    if (step < 7) setStep(s => s + 1)
    if (step === 6) handleSignupFinish()
  }

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1)
  }

  if (mode === 'login') {
    return <LoginView form={form} update={update} onLogin={handleLogin} onSwitchSignup={() => setMode('signup')} />
  }

  return (
    <SignupView
      step={step}
      form={form}
      update={update}
      onNext={handleNext}
      onBack={handleBack}
      onSwitchLogin={() => { setMode('login'); setStep(1) }}
    />
  )
}

/* ── LOGIN ─────────────────────────────────────────── */
function LoginView({ form, update, onLogin, onSwitchSignup }) {
  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.loginContainer} keyboardShouldPersistTaps="handled">
          <Text style={styles.brand}>Village</Text>
          <Text style={styles.loginTitle}>Sign in to your account</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={v => update('email', v)}
              placeholder="you@example.com"
              placeholderTextColor={colors.rule}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={form.password}
                onChangeText={v => update('password', v)}
                placeholder="••••••••"
                placeholderTextColor={colors.rule}
                secureTextEntry={!form.showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => update('showPassword', !form.showPassword)} style={styles.eyeBtn}>
                <Feather name={form.showPassword ? 'eye-off' : 'eye'} size={18} color={colors.inkMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.hint}>
            <Text style={styles.hintText}>Demo: any email and password works.</Text>
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={onLogin}>
            <Text style={styles.btnPrimaryText}>Sign In</Text>
            <Feather name="arrow-right" size={14} color={colors.cream} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchRow} onPress={onSwitchSignup}>
            <Text style={styles.switchText}>Don't have an account? </Text>
            <Text style={[styles.switchText, { color: colors.green, fontWeight: '600' }]}>Create one</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

/* ── SIGNUP ─────────────────────────────────────────── */
function SignupView({ step, form, update, onNext, onBack, onSwitchLogin }) {
  const stepData = STEPS[step - 1]

  return (
    <SafeAreaView style={styles.root}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }]} />
      </View>

      {/* Step labels */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepLabels}>
        {STEPS.map(s => (
          <View key={s.id} style={styles.stepLabelItem}>
            <View style={[styles.stepDot, s.id < step && styles.stepDotDone, s.id === step && styles.stepDotActive]} />
            <Text style={[styles.stepLabelText, s.id === step && styles.stepLabelActive]}>{s.label}</Text>
          </View>
        ))}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.signupContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.stepTitle}>{stepData.title}</Text>

          {step === 1 && <Step1Account form={form} update={update} />}
          {step === 2 && <Step2Profile form={form} update={update} />}
          {step === 3 && <StepFinancial form={form} update={update} vars={INCOME_VARS} field="income" label="Income source" amountLabel="Annual amount" />}
          {step === 4 && <StepFinancial form={form} update={update} vars={DEBT_VARS}   field="debts"  label="Debt type"      amountLabel="Balance owed" />}
          {step === 5 && <StepFinancial form={form} update={update} vars={ASSET_VARS}  field="assets" label="Asset type"     amountLabel="Current value" />}
          {step === 6 && <Step6Bank form={form} update={update} />}
          {step === 7 && <Step7Done form={form} />}

          <View style={styles.navRow}>
            {step > 1 && step < 7 && (
              <TouchableOpacity style={styles.btnOutline} onPress={onBack}>
                <Feather name="arrow-left" size={14} color={colors.ink} />
                <Text style={styles.btnOutlineText}>Back</Text>
              </TouchableOpacity>
            )}
            {step < 7 && (
              <TouchableOpacity style={[styles.btnPrimary, { flex: 1, marginLeft: step > 1 ? 12 : 0 }]} onPress={onNext}>
                <Text style={styles.btnPrimaryText}>{step === 6 ? 'Finish' : 'Continue'}</Text>
                <Feather name="arrow-right" size={14} color={colors.cream} />
              </TouchableOpacity>
            )}
          </View>

          {step === 1 && (
            <TouchableOpacity style={styles.switchRow} onPress={onSwitchLogin}>
              <Text style={styles.switchText}>Already have an account? </Text>
              <Text style={[styles.switchText, { color: colors.green, fontWeight: '600' }]}>Sign in</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function Step1Account({ form, update }) {
  return (
    <>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Email address</Text>
        <TextInput style={styles.input} value={form.email} onChangeText={v => update('email', v)} placeholder="you@example.com" placeholderTextColor={colors.rule} keyboardType="email-address" autoCapitalize="none" />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputRow}>
          <TextInput style={[styles.input, { flex: 1 }]} value={form.password} onChangeText={v => update('password', v)} placeholder="Choose a password" placeholderTextColor={colors.rule} secureTextEntry={!form.showPassword} autoCapitalize="none" />
          <TouchableOpacity onPress={() => update('showPassword', !form.showPassword)} style={styles.eyeBtn}>
            <Feather name={form.showPassword ? 'eye-off' : 'eye'} size={18} color={colors.inkMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}

function Step2Profile({ form, update }) {
  return (
    <>
      <View style={styles.row2}>
        <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>First name</Text>
          <TextInput style={styles.input} value={form.first_name} onChangeText={v => update('first_name', v)} placeholder="First" placeholderTextColor={colors.rule} />
        </View>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>Last name</Text>
          <TextInput style={styles.input} value={form.last_name} onChangeText={v => update('last_name', v)} placeholder="Last" placeholderTextColor={colors.rule} />
        </View>
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={form.phone} onChangeText={v => update('phone', v)} placeholder="+1 (555) 000-0000" placeholderTextColor={colors.rule} keyboardType="phone-pad" />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} value={form.location} onChangeText={v => update('location', v)} placeholder="City, State" placeholderTextColor={colors.rule} />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Primary goal</Text>
        <GoalPicker value={form.goal} onChange={v => update('goal', v)} />
      </View>
    </>
  )
}

function GoalPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <TouchableOpacity style={styles.picker} onPress={() => setOpen(true)}>
        <Text style={styles.pickerText}>{value}</Text>
        <Feather name="chevron-down" size={16} color={colors.inkMuted} />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>Select a goal</Text>
            {GOAL_OPTIONS.map(opt => (
              <TouchableOpacity key={opt} style={styles.pickerOption} onPress={() => { onChange(opt); setOpen(false) }}>
                <Text style={[styles.pickerOptionText, opt === value && { color: colors.green, fontWeight: '600' }]}>{opt}</Text>
                {opt === value && <Feather name="check" size={14} color={colors.green} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  )
}

function StepFinancial({ form, update, vars, field, label, amountLabel }) {
  const items = form[field] || []
  const [showAdd, setShowAdd] = useState(false)
  const [selKey, setSelKey] = useState(vars[0].key)
  const [amount, setAmount] = useState('')
  const [showVarPicker, setShowVarPicker] = useState(false)

  const selectedVar = vars.find(v => v.key === selKey) || vars[0]

  const addItem = () => {
    if (!amount) return
    const updated = [...items, { key: selKey, amount: Number(amount.replace(/,/g, '')) }]
    update(field, updated)
    setAmount('')
    setShowAdd(false)
  }

  const removeItem = (key) => update(field, items.filter(i => i.key !== key))

  const totalAmount = items.reduce((s, i) => s + (i.amount || 0), 0)

  return (
    <>
      {items.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No {field} added yet. Tap + to add.</Text>
        </View>
      )}

      {items.map(item => {
        const varDef = vars.find(v => v.key === item.key)
        return (
          <View key={item.key} style={styles.financialRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.financialLabel}>{varDef?.label || item.key}</Text>
              <Text style={styles.financialAmount}>${item.amount.toLocaleString()}</Text>
            </View>
            <TouchableOpacity onPress={() => removeItem(item.key)} style={styles.removeBtn}>
              <Feather name="x" size={14} color={colors.inkMuted} />
            </TouchableOpacity>
          </View>
        )
      })}

      {items.length > 0 && (
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${totalAmount.toLocaleString()}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
        <Feather name="plus" size={14} color={colors.green} />
        <Text style={styles.addBtnText}>Add {label.toLowerCase()}</Text>
      </TouchableOpacity>

      <Modal visible={showAdd} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowAdd(false)}>
          <View style={styles.addModal} onStartShouldSetResponder={() => true}>
            <Text style={styles.addModalTitle}>Add {label}</Text>

            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity style={styles.picker} onPress={() => setShowVarPicker(true)}>
              <Text style={styles.pickerText}>{selectedVar.label}</Text>
              <Feather name="chevron-down" size={16} color={colors.inkMuted} />
            </TouchableOpacity>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{amountLabel}</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor={colors.rule}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.navRow}>
              <TouchableOpacity style={styles.btnOutline} onPress={() => setShowAdd(false)}>
                <Text style={styles.btnOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnPrimary, { flex: 1, marginLeft: 10 }]} onPress={addItem}>
                <Text style={styles.btnPrimaryText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        {/* Var picker nested modal */}
        <Modal visible={showVarPicker} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowVarPicker(false)}>
            <View style={[styles.pickerModal, { maxHeight: '70%' }]}>
              <Text style={styles.pickerModalTitle}>Select {label.toLowerCase()}</Text>
              <ScrollView>
                {vars.map(v => (
                  <TouchableOpacity key={v.key} style={styles.pickerOption} onPress={() => { setSelKey(v.key); setShowVarPicker(false) }}>
                    <Text style={[styles.pickerOptionText, v.key === selKey && { color: colors.green, fontWeight: '600' }]}>{v.label}</Text>
                    {v.key === selKey && <Feather name="check" size={14} color={colors.green} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </Modal>
    </>
  )
}

function Step6Bank({ form, update }) {
  const [query, setQuery] = useState('')
  const filtered = query.trim()
    ? MOCK_BANKS.filter(b => b.toLowerCase().includes(query.toLowerCase()))
    : MOCK_BANKS

  return (
    <>
      <Text style={styles.sectionSubtitle}>Connect a bank account to automate contributions and payouts.</Text>
      <TextInput
        style={[styles.input, { marginBottom: 12 }]}
        value={query}
        onChangeText={setQuery}
        placeholder="Search banks…"
        placeholderTextColor={colors.rule}
      />
      {filtered.map(bank => (
        <TouchableOpacity
          key={bank}
          style={[styles.bankRow, form.bank === bank && styles.bankRowSelected]}
          onPress={() => update('bank', bank)}
        >
          <View style={styles.bankIcon}>
            <Feather name="home" size={14} color={form.bank === bank ? colors.green : colors.inkMuted} />
          </View>
          <Text style={[styles.bankName, form.bank === bank && { color: colors.green, fontWeight: '600' }]}>{bank}</Text>
          {form.bank === bank && <Feather name="check-circle" size={16} color={colors.green} />}
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={[styles.btnOutline, { marginTop: 16 }]} onPress={() => update('bank', 'skip')}>
        <Text style={styles.btnOutlineText}>Skip for now</Text>
      </TouchableOpacity>
    </>
  )
}

function Step7Done({ form }) {
  return (
    <View style={styles.doneContainer}>
      <View style={styles.doneIcon}>
        <Feather name="check-circle" size={48} color={colors.green} />
      </View>
      <Text style={styles.doneTitle}>Welcome to Village, {form.first_name || 'there'}.</Text>
      <Text style={styles.doneSubtitle}>Your profile is set up. You're ready to join or create a village and start building toward your financial goals.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  loginContainer: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  brand: { fontFamily: 'Georgia', fontSize: 28, fontWeight: '700', color: colors.green, marginBottom: 8 },
  loginTitle: { fontSize: 20, fontWeight: '700', color: colors.ink, marginBottom: 32, fontFamily: 'Georgia' },
  progressBar: { height: 3, backgroundColor: colors.rule, marginHorizontal: 0 },
  progressFill: { height: '100%', backgroundColor: colors.green },
  stepLabels: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
  stepLabelItem: { alignItems: 'center', marginRight: 16 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.rule, marginBottom: 4 },
  stepDotDone: { backgroundColor: colors.green },
  stepDotActive: { backgroundColor: colors.terracotta, transform: [{ scale: 1.3 }] },
  stepLabelText: { fontFamily: 'Courier New', fontSize: 9, letterSpacing: 0.8, color: colors.inkMuted, textTransform: 'uppercase' },
  stepLabelActive: { color: colors.ink, fontWeight: '600' },
  signupContent: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  stepTitle: { fontFamily: 'Georgia', fontSize: 22, fontWeight: '700', color: colors.ink, marginBottom: 24 },
  fieldGroup: { marginBottom: 18 },
  label: { fontFamily: 'Courier New', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkMuted, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: colors.rule, borderRadius: 2,
    padding: 14, fontFamily: 'System', fontSize: 15, color: colors.ink,
    backgroundColor: 'transparent',
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: 14 },
  row2: { flexDirection: 'row' },
  picker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: colors.rule, borderRadius: 2, padding: 14,
  },
  pickerText: { fontSize: 15, color: colors.ink, fontFamily: 'System' },
  pickerModal: {
    backgroundColor: colors.cream, borderRadius: 6, padding: 20,
    marginHorizontal: 24, maxHeight: '80%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12,
  },
  pickerModalTitle: { fontFamily: 'Georgia', fontSize: 16, fontWeight: '700', marginBottom: 16, color: colors.ink },
  pickerOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.rule },
  pickerOptionText: { fontSize: 14, color: colors.ink, fontFamily: 'System', flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(28,26,20,0.4)', justifyContent: 'center' },
  addModal: {
    backgroundColor: colors.cream, margin: 24, borderRadius: 6, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12,
  },
  addModalTitle: { fontFamily: 'Georgia', fontSize: 18, fontWeight: '700', marginBottom: 20, color: colors.ink },
  sectionSubtitle: { fontSize: 14, color: colors.inkMuted, fontFamily: 'System', lineHeight: 22, marginBottom: 20 },
  emptyState: { padding: 24, alignItems: 'center' },
  emptyText: { fontFamily: 'Courier New', fontSize: 12, color: colors.inkMuted, textAlign: 'center' },
  financialRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: colors.rule,
    backgroundColor: colors.creamMid, borderRadius: 2, marginBottom: 1,
  },
  financialLabel: { fontFamily: 'System', fontSize: 13, color: colors.ink },
  financialAmount: { fontFamily: 'Courier New', fontSize: 11, color: colors.inkMuted, marginTop: 2 },
  removeBtn: { padding: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: colors.rule, marginBottom: 16 },
  totalLabel: { fontFamily: 'Courier New', fontSize: 10, letterSpacing: 0.8, color: colors.inkMuted, textTransform: 'uppercase' },
  totalAmount: { fontFamily: 'Courier New', fontSize: 12, color: colors.ink, fontWeight: '600' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.green, borderRadius: 2, marginTop: 8 },
  addBtnText: { fontFamily: 'Courier New', fontSize: 11, letterSpacing: 0.6, color: colors.green },
  bankRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: colors.rule, gap: 12 },
  bankRowSelected: { backgroundColor: 'rgba(42,74,30,0.06)' },
  bankIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.creamDark, alignItems: 'center', justifyContent: 'center' },
  bankName: { flex: 1, fontSize: 14, color: colors.ink, fontFamily: 'System' },
  navRow: { flexDirection: 'row', marginTop: 28 },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.green, borderRadius: 2, paddingVertical: 16, paddingHorizontal: 24,
  },
  btnPrimaryText: { fontFamily: 'Courier New', fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.cream, fontWeight: '600' },
  btnOutline: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: colors.ink, borderRadius: 2, paddingVertical: 16, paddingHorizontal: 24,
  },
  btnOutlineText: { fontFamily: 'Courier New', fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.ink },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  switchText: { fontSize: 14, color: colors.inkMuted, fontFamily: 'System' },
  hint: { backgroundColor: colors.creamMid, borderRadius: 2, padding: 12, marginBottom: 20 },
  hintText: { fontFamily: 'Courier New', fontSize: 11, color: colors.inkMuted, letterSpacing: 0.4 },
  doneContainer: { alignItems: 'center', paddingVertical: 32 },
  doneIcon: { marginBottom: 24 },
  doneTitle: { fontFamily: 'Georgia', fontSize: 22, fontWeight: '700', color: colors.ink, textAlign: 'center', marginBottom: 16 },
  doneSubtitle: { fontFamily: 'System', fontSize: 15, color: colors.inkMuted, textAlign: 'center', lineHeight: 24, maxWidth: 320 },
})

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, theme } from '../components/theme';

function Field({ label, value, onChangeText, placeholder, secure, hint }) {
  const [show, setShow]       = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={theme.label}>{label}</Text>
      <View style={[styles.inputWrap, focused && styles.inputFocused]}>
        <TextInput
          style={[theme.input, { flex: 1, borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 0 }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textDim}
          secureTextEntry={secure && !show}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShow(s => !s)} style={styles.eyeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ color: colors.textMuted, fontSize: 16 }}>{show ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {hint && <Text style={[theme.muted, { marginTop: 4, fontSize: 11 }]}>{hint}</Text>}
    </View>
  );
}

const EMPTY = { username: '', password: '', masterPassword: '', confirmMaster: '' };

export default function LoginScreen() {
  const { login, register } = useAuth();

  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));
  const switchMode = (m) => { setMode(m); setForm(EMPTY); setError(''); };

  const isRegister = mode === 'register';

  const handleSubmit = async () => {
    setError('');
    const { username, password, masterPassword, confirmMaster } = form;

    if (!username || !password || !masterPassword) {
      setError('All fields are required.'); return;
    }
    if (isRegister && masterPassword !== confirmMaster) {
      setError('Master passwords do not match.'); return;
    }
    if (isRegister && masterPassword.length < 8) {
      setError('Master password must be at least 8 characters.'); return;
    }

    setLoading(true);
    try {
      if (isRegister) await register(username, password, masterPassword);
      else            await login(username, password, masterPassword);
      // AppNavigator switches automatically on isLoggedIn
    } catch (err) {
      setError(err.message || (isRegister ? 'Registration failed.' : 'Login failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={theme.safeArea} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.iconWrap}>
            <Text style={{ fontSize: 32 }}>🔐</Text>
          </View>
          <Text style={[theme.heading, { fontSize: 30, textAlign: 'center' }]}>Passify</Text>
          <Text style={[theme.muted, { textAlign: 'center', marginTop: 6 }]}>
            {isRegister ? 'Create your vault — it only takes a moment.' : 'Your vault awaits.'}
          </Text>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabBar}>
          {['login', 'register'].map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.tab, mode === m && styles.tabActive]}
              onPress={() => switchMode(m)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                {m === 'login' ? '🔓 Sign In' : '✨ Create Vault'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Card */}
        <View style={theme.card}>
          {!!error && <View style={theme.msgError}><Text style={theme.msgErrorText}>{error}</Text></View>}

          <Field label="DB Username"   value={form.username}       onChangeText={set('username')}       placeholder="e.g. root" />
          <Field label="DB Password"   value={form.password}       onChangeText={set('password')}       placeholder="Database password"     secure />
          <Field
            label="Master Password"
            value={form.masterPassword}
            onChangeText={set('masterPassword')}
            placeholder={isRegister ? 'Choose a strong master password' : 'Your encryption key'}
            secure
            hint="Never stored — used only to derive your encryption key."
          />

          {isRegister && (
            <>
              <Field
                label="Confirm Master Password"
                value={form.confirmMaster}
                onChangeText={set('confirmMaster')}
                placeholder="Re-enter master password"
                secure
              />

              {/* Info box */}
              <View style={styles.infoBox}>
                <Text style={{ fontSize: 18, marginRight: 10 }}>🛡️</Text>
                <Text style={{ flex: 1, color: colors.gold, fontSize: 12, lineHeight: 18 }}>
                  This creates a new encrypted vault database{' '}
                  <Text style={{ fontWeight: '700' }}>
                    db_password_{form.username || 'username'}
                  </Text>{' '}
                  on your MySQL server. If you forget your master password, data cannot be recovered.
                </Text>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[theme.btnPrimary, { marginTop: 8 }, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#000" />
              : <Text style={theme.btnPrimaryText}>{isRegister ? '✨ Create My Vault' : '🔓 Unlock Vault'}</Text>
            }
          </TouchableOpacity>

          {/* Footer link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 4 }}>
            <Text style={theme.muted}>{isRegister ? 'Already have a vault?' : "Don't have a vault?"}</Text>
            <TouchableOpacity onPress={() => switchMode(isRegister ? 'login' : 'register')}>
              <Text style={{ color: colors.gold, fontWeight: '700', fontSize: 13 }}>
                {isRegister ? ' Sign in' : ' Create one'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[theme.muted, { textAlign: 'center', marginTop: 20, fontSize: 11 }]}>
          Passify · POC · PBKDF2 + Fernet encryption
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1, justifyContent: 'center',
    padding: 24, backgroundColor: colors.bg,
  },
  brand: { alignItems: 'center', marginBottom: 28 },
  iconWrap: {
    width: 72, height: 72, backgroundColor: colors.goldGlow,
    borderRadius: 18, borderWidth: 1, borderColor: colors.goldDim,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  tabBar: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    padding: 4, marginBottom: 16,
  },
  tab: {
    flex: 1, paddingVertical: 11, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  tabActive: { backgroundColor: colors.gold },
  tabText:       { color: colors.textMuted, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#000',           fontWeight: '700', fontSize: 13 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 0 : 2,
  },
  inputFocused: {
    borderColor: colors.gold,
    shadowColor: colors.gold, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  eyeBtn: { paddingLeft: 8, paddingVertical: 12 },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: 'rgba(232,160,32,0.07)',
    borderWidth: 1, borderColor: 'rgba(232,160,32,0.25)',
    borderRadius: 10, padding: 12, marginBottom: 8, marginTop: 4,
  },
});

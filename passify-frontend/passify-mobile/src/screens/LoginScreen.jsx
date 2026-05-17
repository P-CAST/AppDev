import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, theme } from '../components/theme';

// =============================================================
// STABLE FIELD COMPONENT (No layout-shifting structural styles)
// =============================================================
function Field({ label, value, onChangeText, placeholder, secure, hint }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={theme.label}>{label}</Text>
      {/* 
        FIX: The wrapper maintains a constant size and elevation profile. 
        Focusing only modifies the visible stroke color to prevent layout pass cycles.
      */}
      <View style={[styles.inputWrap, focused && styles.inputFocused]}>
        <TextInput
          style={[
            theme.input, 
            { 
              flex: 1, 
              borderWidth: 0, 
              backgroundColor: colors.surface2, 
              paddingHorizontal: 0,
              color: colors.text 
            }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textDim}
          secureTextEntry={secure && !show}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          
          // Clean Android Autofill Overrides
          autoComplete="off"
          importantForAutofill="no"
        />
        {secure && (
          <TouchableOpacity 
            onPress={() => setShow(s => !s)} 
            style={styles.eyeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
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
  const [mode, setMode] = useState('login'); 
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));
  
  const switchMode = (m) => {
    setMode(m);
    setForm(EMPTY);
    setError('');
  };

  const isRegister = mode === 'register';

  const handleSubmit = async () => {
    setError('');
    const { username, password, masterPassword, confirmMaster } = form;

    if (!username.trim() || !masterPassword.trim()) {
      setError('MySQL Username and Master Password are required.');
      return;
    }

    if (isRegister && masterPassword !== confirmMaster) {
      setError('Master passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(username.trim(), password, masterPassword.trim());
      } else {
        await login(username.trim(), password, masterPassword.trim());
      }
    } catch (err) {
      setError(err.message || 'Connection Refused.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={theme.safeArea} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.brand}>
          <View style={styles.iconWrap}>
            <Text style={{ fontSize: 32 }}>🔐</Text>
          </View>
          <Text style={[theme.heading, { fontSize: 30, textAlign: 'center' }]}>Passify</Text>
          <Text style={[theme.muted, { textAlign: 'center', marginTop: 6 }]}>
            {isRegister ? 'Create your vault — it only takes a moment.' : 'Your vault awaits.'}
          </Text>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity style={[styles.tab, !isRegister && styles.tabActive]} onPress={() => switchMode('login')}>
            <Text style={!isRegister ? styles.tabTextActive : styles.tabText}>Connect</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, isRegister && styles.tabActive]} onPress={() => switchMode('register')}>
            <Text style={isRegister ? styles.tabTextActive : styles.tabText}>Register</Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={theme.msgError}>
            <Text style={theme.msgErrorText}>{error}</Text>
          </View>
        ) : null}

        <Field 
          label="MySQL Username" 
          value={form.username} 
          onChangeText={set('username')} 
          placeholder="e.g., root" 
        />
        <Field 
          label="MySQL Password" 
          value={form.password} 
          onChangeText={set('password')} 
          placeholder="Leave blank if none (XAMPP default)" 
          secure 
        />
        <Field 
          label="Master Password" 
          value={form.masterPassword} 
          onChangeText={set('masterPassword')} 
          placeholder="Vault encryption key" 
          secure 
          hint="Used strictly to encrypt your items. Never stored on server."
        />

        {isRegister && (
          <Field 
            label="Confirm Master Password" 
            value={form.confirmMaster} 
            onChangeText={set('confirmMaster')} 
            placeholder="Repeat vault encryption key" 
            secure 
          />
        )}

        <TouchableOpacity style={[theme.btnPrimary, { marginTop: 10 }]} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={theme.btnPrimaryText}>{isRegister ? 'Register & Connect' : 'Connect Vault'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.bg },
  brand: { alignItems: 'center', marginBottom: 28 },
  iconWrap: { width: 72, height: 72, backgroundColor: colors.goldGlow, borderRadius: 18, borderWidth: 1, borderColor: colors.goldDim, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  tabBar: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 11, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.gold },
  tabText: { color: colors.textMuted, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#000', fontWeight: '700', fontSize: 13 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 0 : 2 },
  // FIX: Stripped out layout-altering shadow/elevation parameters to completely eradicate focus feedback cycles
  inputFocused: { borderColor: colors.gold },
  eyeBtn: { paddingLeft: 8, paddingVertical: 12 },
});
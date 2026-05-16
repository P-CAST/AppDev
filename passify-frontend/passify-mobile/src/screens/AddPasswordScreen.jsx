import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { createPassword } from '../api/client';
import { colors, theme } from '../components/theme';

// ── Password Strength ────────────────────────────────────────────
function StrengthMeter({ password }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score  = checks.filter(Boolean).length;
  const colors_ = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#22C55E'];
  const labels  = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <View key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            backgroundColor: i <= score ? colors_[score] : colors.border,
          }} />
        ))}
      </View>
      <Text style={{ fontSize: 11, color: colors_[score] || colors.textMuted }}>
        {labels[score]}
      </Text>
    </View>
  );
}

function generatePassword(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  // React Native doesn't have crypto.getRandomValues natively without polyfill
  // Use Math.random as fallback for POC
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ── Add Password Screen ──────────────────────────────────────────
export default function AddPasswordScreen({ navigation }) {
  const { token, masterPassword } = useAuth();

  const [form, setForm]     = useState({ name: '', tag: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [focused, setFocused] = useState('');

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setError(''); setSuccess('');
    if (!form.name || !form.password) {
      setError('Name and password are required.');
      return;
    }
    setLoading(true);
    try {
      await createPassword({ ...form, master_password: masterPassword }, token);
      setSuccess('Password saved successfully!');
      setTimeout(() => navigation.navigate('Dashboard'), 1200);
    } catch (err) {
      setError(err.message || 'Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={theme.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>← Back</Text>
            </TouchableOpacity>
          </View>

          <Text style={[theme.heading, { marginBottom: 6 }]}>Add Password</Text>
          <Text style={[theme.muted, { marginBottom: 24 }]}>
            Encrypted before storage using your master password.
          </Text>

          <View style={theme.card}>
            {!!error   && <View style={theme.msgError}><Text style={theme.msgErrorText}>{error}</Text></View>}
            {!!success && <View style={theme.msgSuccess}><Text style={theme.msgSuccessText}>{success}</Text></View>}

            {/* Name */}
            <View style={{ marginBottom: 16 }}>
              <Text style={theme.label}>Name <Text style={{ color: colors.red }}>*</Text></Text>
              <TextInput
                style={[theme.input, focused === 'name' && styles.inputFocused]}
                value={form.name}
                onChangeText={set('name')}
                placeholder="e.g. Gmail, GitHub…"
                placeholderTextColor={colors.textDim}
                autoCapitalize="none"
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused('')}
              />
            </View>

            {/* Tag */}
            <View style={{ marginBottom: 16 }}>
              <Text style={theme.label}>Tag <Text style={{ color: colors.textMuted }}>(optional)</Text></Text>
              <TextInput
                style={[theme.input, focused === 'tag' && styles.inputFocused]}
                value={form.tag}
                onChangeText={set('tag')}
                placeholder="e.g. Social, Work, Bank…"
                placeholderTextColor={colors.textDim}
                autoCapitalize="none"
                onFocus={() => setFocused('tag')}
                onBlur={() => setFocused('')}
              />
            </View>

            {/* Password */}
            <View style={{ marginBottom: 16 }}>
              <Text style={theme.label}>Password <Text style={{ color: colors.red }}>*</Text></Text>
              <View style={[styles.passwordRow, focused === 'pwd' && styles.inputFocused]}>
                <TextInput
                  style={[styles.passwordInput, { fontFamily: form.password ? (Platform.OS === 'ios' ? 'Courier New' : 'monospace') : undefined }]}
                  value={form.password}
                  onChangeText={set('password')}
                  placeholder="Enter or generate"
                  placeholderTextColor={colors.textDim}
                  secureTextEntry={!showPwd}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocused('pwd')}
                  onBlur={() => setFocused('')}
                />
                <TouchableOpacity onPress={() => setShowPwd(s => !s)} style={styles.eyeBtn}>
                  <Text style={{ fontSize: 16 }}>{showPwd ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              <StrengthMeter password={form.password} />

              {/* Generate button */}
              <TouchableOpacity
                style={styles.generateBtn}
                onPress={() => { set('password')(generatePassword()); setShowPwd(true); }}
                activeOpacity={0.7}
              >
                <Text style={{ color: colors.gold, fontSize: 13, fontWeight: '600' }}>
                  🎲  Generate Random Password
                </Text>
              </TouchableOpacity>
            </View>

            {/* Encryption note */}
            <View style={styles.encNote}>
              <Text style={{ color: colors.gold, fontSize: 18, marginRight: 10 }}>🛡️</Text>
              <Text style={{ flex: 1, color: colors.gold, fontSize: 12, lineHeight: 18 }}>
                Encrypted with your master password using PBKDF2 + Fernet before storage.
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[theme.btnGhost, { flex: 1 }]}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <Text style={theme.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[theme.btnPrimary, { flex: 1 }, loading && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#000" />
                  : <Text style={theme.btnPrimaryText}>Save</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1, padding: 20, backgroundColor: colors.bg,
  },
  topBar: {
    marginBottom: 20,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: 8, borderWidth: 1, borderColor: colors.border,
  },
  inputFocused: {
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  passwordRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1, color: colors.text, fontSize: 15,
    paddingVertical: 12,
  },
  eyeBtn: {
    paddingLeft: 10, paddingVertical: 12,
  },
  generateBtn: {
    marginTop: 10, padding: 10,
    borderRadius: 8, borderWidth: 1,
    borderColor: 'rgba(232,160,32,0.3)',
    backgroundColor: 'rgba(232,160,32,0.05)',
    alignItems: 'center',
  },
  encNote: {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: 12, borderRadius: 10,
    backgroundColor: 'rgba(232,160,32,0.07)',
    borderWidth: 1, borderColor: 'rgba(232,160,32,0.2)',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row', gap: 10,
  },
});

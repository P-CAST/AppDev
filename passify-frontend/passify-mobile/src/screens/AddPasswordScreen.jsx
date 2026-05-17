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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { createPassword } from '../api/client';
import { colors, theme } from '../components/theme';

function StrengthMeter({ password }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors_ = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#22C55E'];
  const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              backgroundColor: i <= score ? colors_[score] : colors.border,
            }}
          />
        ))}
      </View>
      <Text style={{ fontSize: 11, color: colors_[score] || colors.textMuted }}>{labels[score]}</Text>
    </View>
  );
}

function generatePassword(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function AddPasswordScreen({ navigation }) {
  const { username, password, masterPassword } = useAuth();
  const [form, setForm] = useState({ name: '', tag: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const credentials = { username, password, masterPassword };

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const fillRandom = () => {
    const generated = generatePassword();
    setForm(f => ({ ...f, password: generated }));
    setShowPwd(true);
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    if (!form.name.trim() || !form.password.trim()) {
      setError('Name and password are required.');
      return;
    }
    setLoading(true);

    try {
      await createPassword(
        {
          name: form.name.trim(),
          tag: form.tag.trim(),
          password: form.password,
          master_password: masterPassword,
        },
        credentials
      );
      setSuccess('Password saved successfully!');
      setTimeout(() => navigation.navigate('Dashboard'), 1200);
    } catch (err) {
      setError(err.message || 'Failed to write.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={theme.safeArea} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={{ color: colors.textMuted, fontSize: 15 }}>← Back</Text>
            </TouchableOpacity>
          </View>

          <Text style={[theme.heading, { marginBottom: 20 }]}>New Password</Text>

          {error ? (
            <View style={theme.msgError}>
              <Text style={theme.msgErrorText}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={theme.msgSuccess}>
              <Text style={theme.msgSuccessText}>{success}</Text>
            </View>
          ) : null}

          <View style={{ marginBottom: 14 }}>
            <Text style={theme.label}>Service Name</Text>
            <TextInput
              style={theme.input}
              placeholder="e.g., Google, Netflix"
              placeholderTextColor={colors.textDim}
              value={form.name}
              onChangeText={set('name')}
            />
          </View>

          <View style={{ marginBottom: 14 }}>
            <Text style={theme.label}>Tag (Optional)</Text>
            <TextInput
              style={theme.input}
              placeholder="e.g., Work, Personal"
              placeholderTextColor={colors.textDim}
              value={form.tag}
              onChangeText={set('tag')}
            />
          </View>

          <View style={{ marginBottom: 14 }}>
            <Text style={theme.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter password"
                placeholderTextColor={colors.textDim}
                secureTextEntry={!showPwd}
                value={form.password}
                onChangeText={set('password')}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                <Text style={{ fontSize: 16 }}>{showPwd ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            <StrengthMeter password={form.password} />

            <TouchableOpacity onPress={fillRandom} style={styles.generateBtn}>
              <Text style={{ color: colors.gold, fontWeight: '600', fontSize: 13 }}>⚡ Generate Strong Password</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.encNote}>
            <Text style={{ color: colors.gold, fontSize: 12, lineHeight: 16 }}>
              🛡️ This record will be encrypted locally using your Master Password before submission.
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={[theme.btnPrimary, { flex: 1 }]} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" /> : <Text style={theme.btnPrimaryText}>Save Entry</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 20, backgroundColor: colors.bg },
  topBar: { marginBottom: 20 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  passwordRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14 },
  passwordInput: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 12 },
  eyeBtn: { paddingLeft: 10, paddingVertical: 12 },
  generateBtn: { marginTop: 10, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(232,160,32,0.3)', backgroundColor: 'rgba(232,160,32,0.05)', alignItems: 'center' },
  encNote: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderRadius: 10, backgroundColor: 'rgba(232,160,32,0.07)', borderWidth: 1, borderColor: 'rgba(232,160,32,0.2)', marginBottom: 20 },
  actions: { flexDirection: 'row', gap: 10 },
});
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, RefreshControl, Alert, Modal, ActivityIndicator,
  Clipboard, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { fetchPasswords, deletePassword, fetchPasswordById } from '../api/client';
import { colors, theme } from '../components/theme';

// ── Password Modal ───────────────────────────────────────────────
function PasswordModal({ entry, token, masterPassword, visible, onClose }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [show, setShow]       = useState(false);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    if (!visible || !entry) return;
    setData(null); setError(''); setLoading(true); setShow(false);
    fetchPasswordById(entry.id, token, masterPassword)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [visible, entry]);

  const copyPassword = () => {
    if (!data?.password) return;
    Clipboard.setString(data.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={theme.subheading}>{entry?.name}</Text>
              {entry?.tag ? (
                <View style={[theme.tag, { marginTop: 4, alignSelf: 'flex-start' }]}>
                  <Text style={theme.tagText}>{entry.tag}</Text>
                </View>
              ) : null}
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={{ color: colors.textMuted, fontSize: 24, lineHeight: 24 }}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={{ padding: 20 }}>
            <Text style={theme.label}>Password</Text>
            {loading && <ActivityIndicator color={colors.gold} />}
            {!!error && <View style={theme.msgError}><Text style={theme.msgErrorText}>{error}</Text></View>}
            {data && (
              <>
                <View style={styles.passwordBox}>
                  <Text style={[styles.passwordText, { letterSpacing: show ? 1 : 4 }]} numberOfLines={1}>
                    {show ? data.password : '•'.repeat(Math.min(data.password.length, 18))}
                  </Text>
                  <TouchableOpacity onPress={() => setShow(s => !s)} style={styles.iconBtn}>
                    <Text style={{ fontSize: 16 }}>{show ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={copyPassword} style={styles.iconBtn}>
                    <Text style={{ fontSize: 16 }}>{copied ? '✅' : '📋'}</Text>
                  </TouchableOpacity>
                </View>
                {copied && <Text style={{ color: colors.green, fontSize: 12, marginTop: 4 }}>Copied to clipboard!</Text>}
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Password Card ────────────────────────────────────────────────
function PasswordCard({ item, onView, onDelete }) {
  return (
    <View style={styles.entryCard}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
      </View>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[theme.body, { fontWeight: '600' }]}>{item.name}</Text>
        {item.tag ? (
          <View style={[theme.tag, { alignSelf: 'flex-start', marginTop: 3 }]}>
            <Text style={theme.tagText}>{item.tag}</Text>
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', gap: 6 }}>
        <TouchableOpacity style={styles.cardBtn} onPress={onView} activeOpacity={0.7}>
          <Text style={{ fontSize: 15 }}>👁️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.cardBtn, { borderColor: 'rgba(239,68,68,0.3)' }]} onPress={onDelete} activeOpacity={0.7}>
          <Text style={{ fontSize: 15 }}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Dashboard Screen ─────────────────────────────────────────────
export default function DashboardScreen({ navigation }) {
  const { token, username, masterPassword, logout } = useAuth();

  const [passwords, setPasswords]   = useState([]);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState('');
  const [viewing, setViewing]       = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const data = await fetchPasswords(token);
      setPasswords(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (item) => {
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete "${item.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await deletePassword(item.id, token);
              load();
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Lock vault and logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const filtered = passwords.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.tag || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={theme.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={theme.heading}>Your Vault</Text>
          <Text style={theme.muted}>Welcome back, {username}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={{ color: colors.textMuted, fontSize: 20 }}>🔓</Text>
        </TouchableOpacity>
      </View>

      {/* Search + Add */}
      <View style={styles.toolbar}>
        <TextInput
          style={[theme.input, { flex: 1 }]}
          placeholder="Search…"
          placeholderTextColor={colors.textDim}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity
          style={[theme.btnPrimary, { paddingHorizontal: 16, paddingVertical: 12 }]}
          onPress={() => navigation.navigate('AddPassword')}
          activeOpacity={0.85}
        >
          <Text style={theme.btnPrimaryText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Stored',    value: passwords.length },
          { label: 'Filtered',  value: filtered.length },
          { label: 'Encrypted', value: passwords.length },
        ].map(s => (
          <View key={s.label} style={[theme.card, styles.statCard]}>
            <Text style={[theme.heading, { fontSize: 22, color: colors.gold }]}>{s.value}</Text>
            <Text style={[theme.muted, { fontSize: 11, marginTop: 2 }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Error */}
      {!!error && (
        <View style={[theme.msgError, { marginHorizontal: 16 }]}>
          <Text style={theme.msgErrorText}>{error}</Text>
        </View>
      )}

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={colors.gold}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🗄️</Text>
              <Text style={[theme.muted, { textAlign: 'center' }]}>
                {passwords.length === 0 ? 'No passwords saved yet.\nTap "+ New" to add one.' : 'No results found.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <PasswordCard
              item={item}
              onView={() => { setViewing(item); setModalVisible(true); }}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}

      {/* Modal */}
      <PasswordModal
        entry={viewing}
        token={token}
        masterPassword={masterPassword}
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setViewing(null); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  logoutBtn: {
    marginLeft: 'auto', padding: 8,
  },
  toolbar: {
    flexDirection: 'row', gap: 10, alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  statsRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingBottom: 12,
  },
  statCard: {
    flex: 1, alignItems: 'center', padding: 12,
  },
  listContent: {
    paddingHorizontal: 16, paddingBottom: 30, flexGrow: 1,
  },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 60,
  },
  entryCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    padding: 14, marginBottom: 8,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: colors.goldGlow,
    borderWidth: 1, borderColor: colors.goldDim,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: colors.gold, fontSize: 16, fontWeight: '700',
  },
  cardBtn: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: colors.surface2,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  modalCard: {
    width: '100%', maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: 16, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: 18, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  passwordBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface2,
    borderRadius: 10, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 12, marginTop: 8,
  },
  passwordText: {
    flex: 1, color: colors.text, fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  iconBtn: {
    paddingLeft: 10,
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { fetchPasswords, deletePassword, fetchPasswordById } from '../api/client';
import { colors, theme } from '../components/theme';

function PasswordModal({ entry, creds, visible, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible || !entry) return;
    setData(null);
    setError('');
    setLoading(true);
    setShow(false);

    fetchPasswordById(entry.id, creds)
      .then((res) => {
        // FIX: Extract data cleanly from response envelope wrapper
        if (res && res.success) {
          setData(res.data);
        } else {
          setError('Could not read decryption package.');
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [visible, entry]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
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

          <View style={{ padding: 20 }}>
            {loading ? (
              <ActivityIndicator color={colors.gold} />
            ) : error ? (
              <Text style={{ color: colors.red }}>{error}</Text>
            ) : (
              <View>
                <Text style={theme.label}>Decrypted Password</Text>
                <View style={styles.passwordBox}>
                  <Text style={styles.passwordText}>
                    {show ? data?.password : '••••••••••••••••'}
                  </Text>
                  <TouchableOpacity onPress={() => setShow(!show)} style={styles.iconBtn}>
                    <Text style={{ fontSize: 16 }}>{show ? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function PasswordCard({ item, onView, onDelete }) {
  // Defensive fallbacks to avoid layout rendering faults
  const displayName = item?.name || item?.site_name || 'Unknown Item';
  const displayTag = item?.tag || item?.category || '';

  return (
    <View style={styles.entryCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{displayName[0].toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={theme.subheading}>{displayName}</Text>
        {displayTag ? (
          <View style={[theme.tag, { marginTop: 4, alignSelf: 'flex-start' }]}>
            <Text style={theme.tagText}>{displayTag}</Text>
          </View>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'nowrap', alignItems: 'center',}}>
        <TouchableOpacity onPress={() => onView(item)} style={styles.cardBtn}>
          <Text style={{ color: colors.gold }}>Show</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item)} style={styles.cardBtn}>
          <Text style={{ color: colors.red }}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const { username, password, masterPassword, logout } = useAuth();
  const [passwords, setPasswords] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const credentials = { username, password, masterPassword };

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const res = await fetchPasswords(credentials);
      
      // FIX: Check payload structure and assign inner data array element safely
      if (res && res.success && Array.isArray(res.data)) {
        setPasswords(res.data);
      } else {
        setPasswords([]);
      }
    } catch (e) {
      setError(e.message || 'Failed to populate vault.');
      setPasswords([]); 
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [username, password, masterPassword]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = (item) => {
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete "${item.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePassword(item.id, credentials);
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
    Alert.alert('Logout', 'Lock vault and disconnect?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  // FIX: Added defensive check layout arrays fallback logic to safeguard .filter executions
  const filtered = (passwords || []).filter(p => {
    if (!p) return false;
    const nameMatch = p.name ? p.name.toLowerCase().includes(search.toLowerCase()) : false;
    const tagMatch = p.tag ? p.tag.toLowerCase().includes(search.toLowerCase()) : false;
    return nameMatch || tagMatch;
  });

  return (
    <SafeAreaView style={theme.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={theme.heading}>Your Vault</Text>
          <Text style={theme.muted}>Welcome back, {username}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={{ fontSize: 20 }}>🔓</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toolbar}>
        <TextInput
          style={[theme.input, { flex: 1 }]}
          placeholder="Search vault"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity 
          style={[theme.btnGhost, { marginBottom: 16 }]} 
          onPress={() => navigation.navigate('Generator')}
        >
          <Text style={theme.btnGhostText}>Open Password Generator</Text>
        </TouchableOpacity>
        <TouchableOpacity style={theme.btnPrimary} onPress={() => navigation.navigate('AddPassword')}>
          <Text style={theme.btnPrimaryText}>+</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={[theme.msgError, { marginHorizontal: 16 }]}>
          <Text style={theme.msgErrorText}>{error}</Text>
        </View>
      ) : null}

      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.gold} size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.gold} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: colors.textMuted, fontSize: 15 }}>
                {search ? 'No items match your search.' : '0 stored entries found.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <PasswordCard
              item={item}
              onView={(entry) => {
                setViewing(entry);
                setModalVisible(true);
              }}
              onDelete={handleDelete}
            />
          )}
        />
      )}

      <PasswordModal
        entry={viewing}
        creds={credentials}
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setViewing(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  logoutBtn: { marginLeft: 'auto', padding: 8 },
  toolbar: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  listContent: { paddingHorizontal: 16, paddingBottom: 30, flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  entryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 8 },
  avatar: { width: 42, height: 42, borderRadius: 10, backgroundColor: colors.goldGlow, borderWidth: 1, borderColor: colors.goldDim, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { color: colors.gold, fontSize: 16, fontWeight: '700' },
  cardBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 400, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: colors.border },
  passwordBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface2, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12, marginTop: 8 },
  passwordText: { flex: 1, color: colors.text, fontSize: 14, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  iconBtn: { paddingLeft: 10 },
});
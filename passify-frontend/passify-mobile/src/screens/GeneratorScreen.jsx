import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, theme } from '../components/theme';

export default function GeneratorScreen({ navigation }) {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    let chars = 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }
    setGeneratedPassword(password);
    setCopied(false);
  }, [length, includeUppercase, includeNumbers, includeSymbols]);

  const handleCopy = () => {
    if (!generatedPassword) return;
    Clipboard.setString(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const adjustLength = (amount) => {
    setLength((prev) => Math.max(8, Math.min(32, prev + amount)));
  };

  return (
    <SafeAreaView style={theme.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: colors.textMuted, fontSize: 16 }}>Back</Text>
        </TouchableOpacity>

        <View style={theme.card}>
          <Text style={[theme.heading, { marginBottom: 20 }]}>Password Generator</Text>

          <View style={styles.settingRow}>
            <Text style={theme.body}>Length: {length}</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => adjustLength(-1)}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stepBtn} onPress={() => adjustLength(1)}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={theme.body}>Uppercase Letters</Text>
            <Switch 
              value={includeUppercase} 
              onValueChange={setIncludeUppercase}
              trackColor={{ false: colors.surface2, true: colors.goldDim }}
              thumbColor={includeUppercase ? colors.gold : colors.textMuted}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={theme.body}>Numbers</Text>
            <Switch 
              value={includeNumbers} 
              onValueChange={setIncludeNumbers}
              trackColor={{ false: colors.surface2, true: colors.goldDim }}
              thumbColor={includeNumbers ? colors.gold : colors.textMuted}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={theme.body}>Symbols</Text>
            <Switch 
              value={includeSymbols} 
              onValueChange={setIncludeSymbols}
              trackColor={{ false: colors.surface2, true: colors.goldDim }}
              thumbColor={includeSymbols ? colors.gold : colors.textMuted}
            />
          </View>

          <TouchableOpacity style={[theme.btnPrimary, { marginTop: 20 }]} onPress={handleGenerate}>
            <Text style={theme.btnPrimaryText}>Generate Password</Text>
          </TouchableOpacity>

          {generatedPassword ? (
            <View style={{ marginTop: 24 }}>
              <Text style={theme.label}>Generated Result</Text>
              <View style={styles.resultContainer}>
                <Text style={styles.passwordText}>{generatedPassword}</Text>
              </View>
              <TouchableOpacity style={[theme.btnGhost, { marginTop: 10 }]} onPress={handleCopy}>
                <Text style={theme.btnGhostText}>{copied ? 'Copied' : 'Copy Password'}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 20, backgroundColor: colors.bg },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  stepBtn: { width: 36, height: 36, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  resultContainer: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 14, alignItems: 'center', justifyContent: 'center' },
  passwordText: { color: colors.text, fontSize: 16, fontFamily: 'monospace', textAlign: 'center' }
});
import { StyleSheet } from 'react-native';

export const colors = {
  bg:         '#080A12',
  surface:    '#0F1220',
  surface2:   '#161B2E',
  border:     'rgba(255,255,255,0.08)',
  borderGlow: 'rgba(232,160,32,0.40)',

  gold:       '#E8A020',
  goldDim:    '#A86D10',
  goldGlow:   'rgba(232,160,32,0.12)',

  text:       '#F0F2F8',
  textMuted:  '#6B7280',
  textDim:    '#374151',

  red:        '#EF4444',
  green:      '#22C55E',
};

export const theme = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  heading: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subheading: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  body: {
    color: colors.text,
    fontSize: 15,
  },
  muted: {
    color: colors.textMuted,
    fontSize: 13,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  btnPrimary: {
    backgroundColor: colors.gold,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnPrimaryText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnGhostText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  btnDanger: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDangerText: {
    color: colors.red,
    fontWeight: '600',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  msgError: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  msgErrorText: {
    color: colors.red,
    fontSize: 13,
  },
  msgSuccess: {
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  msgSuccessText: {
    color: colors.green,
    fontSize: 13,
  },
  tag: {
    backgroundColor: 'rgba(232,160,32,0.12)',
    borderWidth: 1,
    borderColor: '#A86D10',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
});

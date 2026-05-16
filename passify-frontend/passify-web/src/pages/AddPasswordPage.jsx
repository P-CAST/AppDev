import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPassword } from '../api/client';

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

// ── Password Strength Meter ──────────────────────────────────────
function StrengthMeter({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#22C55E'];
  const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

  if (!password) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= score ? colors[score] : 'var(--border)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: colors[score] || 'var(--text-muted)' }}>
        {labels[score]}
      </span>
    </div>
  );
}

// ── Random Password Generator ────────────────────────────────────
function generatePassword(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  return Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map(n => chars[n % chars.length])
    .join('');
}

// ── Main Component ───────────────────────────────────────────────
export default function AddPasswordPage() {
  const { token, masterPassword } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]     = useState({ name: '', tag: '', password: '' });
  const [show, setShow]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const fillRandom = () => {
    const pwd = generatePassword();
    setForm(f => ({ ...f, password: pwd }));
    setShow(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name || !form.password) {
      setError('Name and password are required.');
      return;
    }
    setLoading(true);
    try {
      await createPassword({ ...form, master_password: masterPassword }, token);
      setSuccess('Password saved successfully!');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError(err.message || 'Failed to save password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ alignItems: 'stretch', maxWidth: 520, margin: '0 auto' }}>
      {/* Back */}
      <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', marginBottom: 24, padding: '7px 14px' }}
        onClick={() => navigate('/dashboard')}>
        <ArrowLeftIcon /> Back to Vault
      </button>

      <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
        Add New Password
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
        Your password will be encrypted before being stored.
      </p>

      <div className="card fade-up">
        {error   && <div className="msg-error"   style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="msg-success" style={{ marginBottom: 16 }}>{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Name */}
          <div className="input-group">
            <label className="input-label">Name <span style={{ color: 'var(--red)' }}>*</span></label>
            <input className="input" type="text" placeholder="e.g. Gmail, GitHub…"
              value={form.name} onChange={set('name')} />
          </div>

          {/* Tag */}
          <div className="input-group">
            <label className="input-label">Tag <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
            <input className="input" type="text" placeholder="e.g. Social, Work, Bank…"
              value={form.tag} onChange={set('tag')} />
          </div>

          {/* Password */}
          <div className="input-group">
            <label className="input-label">Password <span style={{ color: 'var(--red)' }}>*</span></label>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  className="input"
                  type={show ? 'text' : 'password'}
                  placeholder="Enter or generate a password"
                  value={form.password}
                  onChange={set('password')}
                  style={{ paddingRight: 44, fontFamily: form.password ? 'var(--font-mono)' : undefined }}
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {show
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              <button type="button" className="btn btn-ghost" onClick={fillRandom}
                style={{ padding: '10px 14px', flexShrink: 0 }} title="Generate random password">
                <RefreshIcon />
              </button>
            </div>
            <StrengthMeter password={form.password} />
          </div>

          {/* Encryption note */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '12px 14px', background: 'var(--gold-glow)',
            border: '1px solid var(--gold-dim)', borderRadius: 'var(--radius)', marginTop: 4,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <p style={{ fontSize: 12, color: 'var(--gold)', lineHeight: 1.5 }}>
              Encrypted with your master password using PBKDF2 + Fernet before storage.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }}
              onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Save Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LockIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

const EyeIcon = ({ off }) => off
  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

// ── Shared field ────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text', isPassword, hint }) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          className="input"
          type={isPassword ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ paddingRight: isPassword ? 44 : undefined }}
          autoComplete="off"
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
          }}>
            <EyeIcon off={show} />
          </button>
        )}
      </div>
      {hint && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{hint}</p>}
    </div>
  );
}

const EMPTY = { username: '', password: '', masterPassword: '', confirmMaster: '' };

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const switchMode = (m) => { setMode(m); setForm(EMPTY); setError(''); setSuccess(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    const { username, password, masterPassword, confirmMaster } = form;

    if (!username || !password || !masterPassword) {
      setError('All fields are required.');
      return;
    }

    if (mode === 'register') {
      if (masterPassword !== confirmMaster) {
        setError('Master passwords do not match.');
        return;
      }
      if (masterPassword.length < 8) {
        setError('Master password must be at least 8 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(username, password, masterPassword);
      } else {
        await register(username, password, masterPassword);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || (mode === 'login' ? 'Login failed.' : 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  const isRegister = mode === 'register';

  return (
    <div className="page" style={{ justifyContent: 'center' }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 440 }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72,
            background: 'var(--gold-glow)', border: '1px solid var(--gold-dim)',
            borderRadius: 18, color: 'var(--gold)', marginBottom: 18,
          }}>
            <LockIcon />
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Passify
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>
            {isRegister ? 'Create your vault — it only takes a moment.' : 'Your vault awaits. Enter your credentials.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 4, marginBottom: 20,
        }}>
          {['login', 'register'].map(m => (
            <button key={m} type="button" onClick={() => switchMode(m)} style={{
              flex: 1, padding: '10px', border: 'none', cursor: 'pointer', borderRadius: 9,
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
              transition: 'all 0.2s',
              background: mode === m ? 'var(--gold)' : 'transparent',
              color: mode === m ? '#000' : 'var(--text-muted)',
            }}>
              {m === 'login' ? '🔓 Sign In' : '✨ Create Vault'}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {error   && <div className="msg-error">{error}</div>}
          {success && <div className="msg-success">{success}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <Field label="DB Username" value={form.username} onChange={set('username')} placeholder="e.g. root" />
            <Field label="DB Password" value={form.password} onChange={set('password')} placeholder="Database password" isPassword />
            <Field
              label="Master Password"
              value={form.masterPassword}
              onChange={set('masterPassword')}
              placeholder={isRegister ? 'Choose a strong master password' : 'Your encryption key'}
              isPassword
              hint="Never stored — used only to derive your encryption key."
            />

            {/* Confirm field — only on register */}
            {isRegister && (
              <Field
                label="Confirm Master Password"
                value={form.confirmMaster}
                onChange={set('confirmMaster')}
                placeholder="Re-enter master password"
                isPassword
              />
            )}

            {/* Register info box */}
            {isRegister && (
              <div style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                padding: '12px 14px', background: 'var(--gold-glow)',
                border: '1px solid var(--gold-dim)', borderRadius: 10,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>🛡️</span>
                <p style={{ fontSize: 12, color: 'var(--gold)', lineHeight: 1.6 }}>
                  This will create a new encrypted vault database (<code style={{ fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.2)', padding: '1px 5px', borderRadius: 4 }}>db_password_{form.username || 'username'}</code>) on your MySQL server.
                  Your master password is never stored — if you forget it, your data cannot be recovered.
                </p>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 4 }}
              disabled={loading}
            >
              {loading
                ? <span className="spinner" />
                : isRegister ? '✨ Create My Vault' : '🔓 Unlock Vault'
              }
            </button>
          </form>

          {/* Footer link */}
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            {isRegister ? 'Already have a vault? ' : "Don't have a vault? "}
            <button type="button" onClick={() => switchMode(isRegister ? 'login' : 'register')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--gold)', fontWeight: 600, fontSize: 13,
            }}>
              {isRegister ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 20 }}>
          Passify — POC · Encrypted with PBKDF2 + Fernet
        </p>
      </div>
    </div>
  );
}

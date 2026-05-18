import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchPasswords, deletePassword, fetchPasswordById } from '../api/client';

// ── Icons ───────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

function PasswordModal({ entry, creds, onClose }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [copied, setCopied]   = useState(false);
  const [show, setShow]       = useState(false);

  useEffect(() => {
    fetchPasswordById(entry.id, creds)
      .then(res => {
        // Unpack the backend envelope safely
        if (res && res.data) {
          setData(res.data);
        } else {
          setData(res);
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [entry.id, creds]);

  const copyPassword = () => {
    if (!data?.password) return;
    navigator.clipboard.writeText(data.password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card fade-up" style={{ width: '100%', maxWidth: 440, gap: 0, padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 17 }}>{entry.name}</div>
            {entry.tag && <span className="tag" style={{ marginTop: 4, display: 'inline-block' }}>{entry.tag}</span>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {loading && <div style={{ display: 'flex', justifyContent: 'center' }}><span className="spinner" /></div>}
          {error   && <div className="msg-error">{error}</div>}
          {data && data.password && (
            <div>
              <div className="input-label" style={{ marginBottom: 8 }}>Password</div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '10px 14px',
              }}>
                <span style={{
                  flex: 1, fontFamily: 'var(--font-mono)', fontSize: 15,
                  letterSpacing: show ? '0.05em' : '0.15em',
                  color: show ? 'var(--text)' : 'var(--text-muted)',
                }}>
                  {show ? data.password : '•'.repeat(Math.min(data.password.length, 20))}
                </span>
                <button onClick={() => setShow(s => !s)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {show
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
                <button onClick={copyPassword}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--green)' : 'var(--text-muted)' }}>
                  <CopyIcon />
                </button>
              </div>
              {copied && <p style={{ color: 'var(--green)', fontSize: 12, marginTop: 6 }}>Copied to clipboard!</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ── Delete Confirm Dialog ───────────────────────────────────────
function DeleteDialog({ entry, onConfirm, onCancel, loading }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div className="card fade-up" style={{ width: '100%', maxWidth: 380, textAlign: 'center', gap: 0 }}>
        <div style={{ color: 'var(--red)', marginBottom: 12 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete Entry?</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
          <strong style={{ color: 'var(--text)' }}>{entry.name}</strong> will be permanently deleted.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────
export default function DashboardPage() {
  // Added "logout" mapping since it was missing from your useAuth destructuring
  const { username, password, masterPassword, logout } = useAuth();
  const navigate = useNavigate();

  const [passwords, setPasswords]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [viewing, setViewing]       = useState(null);
  const [deleting, setDeleting]     = useState(null);
  const [delLoading, setDelLoading] = useState(false);

  // Grouped credential object to stay DRY
  const credentials = { username, password, masterPassword };

  const loadPasswords = useCallback(async () => {
    setLoading(true);
    setError(''); // Clear past errors on refresh
    try {
      const result = await fetchPasswords(credentials);
      
      // SAFE UNPACKING:
      // If the backend returns a wrapped envelope {"data": [...]}, extract it.
      // If it's already a raw array, use it directly. Otherwise, fall back to [].
      if (result && Array.isArray(result)) {
        setPasswords(result);
      } else if (result && result.data && Array.isArray(result.data)) {
        setPasswords(result.data);
      } else {
        setPasswords([]);
      }
    } catch (e) {
      setError(e.message || 'Failed to fetch vault items.');
      setPasswords([]); // Gracefully fall back to an empty list so the UI doesn't crash
    } finally {
      setLoading(false);
    }
  }, [username, password, masterPassword]);

  useEffect(() => { loadPasswords(); }, [loadPasswords]);

  const handleDelete = async () => {
    setDelLoading(true);
    try {
      // Replaced old 'token' reference with our mandatory credential bundle
      await deletePassword(deleting.id, credentials);
      setDeleting(null);
      loadPasswords();
    } catch (e) {
      setError(e.message);
      setDeleting(null);
    } finally {
      setDelLoading(false);
    }
  };

  const filtered = passwords.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.tag || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page" style={{ alignItems: 'stretch', maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 26 }}>
            Your Vault
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Welcome back, {username}</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/generator')}>
            Password Generator
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/add')}>
            <PlusIcon /> New Password
          </button>
          <button className="btn btn-ghost" onClick={logout} title="Logout">
            <LogoutIcon />
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          className="input"
          placeholder="Search by name or tag…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
      </div>

      {/* Error */}
      {error && <div className="msg-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Stats strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24,
      }}>
        {[
          { label: 'Stored', value: passwords.length },
          { label: 'Filtered', value: filtered.length },
          { label: 'Encrypted', value: passwords.length },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, color: 'var(--gold)' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <span className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 16 }}>{passwords.length === 0 ? 'No passwords saved yet.' : 'No results match your search.'}</p>
          {passwords.length === 0 && (
            <button className="btn btn-primary" onClick={() => navigate('/add')} style={{ marginTop: 16 }}>
              <PlusIcon /> Add your first password
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((p, i) => (
            <div key={p.id} className="card fade-up" style={{
              padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
              animationDelay: `${i * 0.04}s`,
              cursor: 'default',
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-glow)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {/* Avatar */}
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'var(--gold-glow)', border: '1px solid var(--gold-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-head)', fontWeight: 700,
                color: 'var(--gold)', fontSize: 16, flexShrink: 0,
              }}>
                {p.name ? p.name[0].toUpperCase() : '?'}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                {p.tag && <span className="tag" style={{ marginTop: 3, display: 'inline-block' }}>{p.tag}</span>}
              </div>

              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="btn btn-ghost" style={{ padding: '7px 12px', gap: 5, fontSize: 13 }}
                  onClick={() => setViewing(p)}>
                  <EyeIcon /> View
                </button>
                <button className="btn btn-danger" style={{ padding: '7px 10px' }}
                  onClick={() => setDeleting(p)}>
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {viewing && (
        <PasswordModal
          entry={viewing}
          creds={credentials}
          onClose={() => setViewing(null)}
        />
      )}
      {deleting && (
        <DeleteDialog
          entry={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={delLoading}
        />
      )}
    </div>
  );
}
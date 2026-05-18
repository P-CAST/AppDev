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

// the password strength 
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

function generatePassword(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  return Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map(n => chars[n % chars.length])
    .join('');
}

export default function AddPasswordPage() {
  const { username, password, masterPassword } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ name: '', tag: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      const credentials = { username, password, masterPassword };
      await createPassword(form, credentials);
      
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
      <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', marginBottom: 24, padding: '7px 14px' }} onClick={() => navigate('/dashboard')}>
        Back
      </button>
      
      <div className="card">
        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 22, marginBottom: 24 }}>Add New Password</h2>
        
        {error && <div className="msg-error" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="msg-success" style={{ marginBottom: 16 }}>{success}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="input-group">
            <label className="input-label">Name</label>
            <input className="input" placeholder="e.g. Google, GitHub" value={form.name} onChange={set('name')} />
          </div>
          
          <div className="input-group">
            <label className="input-label">Tag / Category (Optional)</label>
            <input className="input" placeholder="e.g. Work, Personal" value={form.tag} onChange={set('tag')} />
          </div>
          
          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: 2 }}>
              <label className="input-label">Password</label>
              <button type="button" className="btn-link" style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 12, cursor: 'pointer', marginLeft: 'auto' }} onClick={fillRandom}>
                Generate Random
              </button>
            </div>
            
            <div style={{ position: 'relative' }}>
              <input className="input" type={show ? 'text' : 'password'} placeholder="Enter or generate password" value={form.password} onChange={set('password')} />
            </div>
            
            <StrengthMeter password={form.password} />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? <div className="spinner" /> : 'Save Password Entry'}
          </button>
        </form>
      </div>
    </div>
  );
}

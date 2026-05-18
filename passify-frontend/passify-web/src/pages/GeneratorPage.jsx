import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GeneratorPage() {
  const navigate = useNavigate();
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

    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars[array[i] % chars.length];
    }
    setGeneratedPassword(password);
    setCopied(false);
  }, [length, includeUppercase, includeNumbers, includeSymbols]);

  const handleCopy = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="page" style={{ alignItems: 'stretch', maxWidth: 520, margin: '0 auto' }}>
      <button 
        className="btn btn-ghost" 
        style={{ alignSelf: 'flex-start', marginBottom: 24, padding: '7px 14px' }} 
        onClick={() => navigate('/dashboard')}
      >
        Back to Vault
      </button>
      
      <div className="card">
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 26, marginBottom: 24 }}>
          Password Generator
        </h1>

        <div style={{ marginBottom: 20 }}>
          <label className="input-label">Length: {length}</label>
          <input 
            type="range" 
            min="8" 
            max="32" 
            value={length} 
            onChange={(e) => setLength(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--gold)', marginTop: 8 }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={includeUppercase} 
              onChange={(e) => setIncludeUppercase(e.target.checked)} 
              style={{ accentColor: 'var(--gold)' }} 
            />
            <span>Include Uppercase Letters</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={includeNumbers} 
              onChange={(e) => setIncludeNumbers(e.target.checked)} 
              style={{ accentColor: 'var(--gold)' }} 
            />
            <span>Include Numbers</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={includeSymbols} 
              onChange={(e) => setIncludeSymbols(e.target.checked)} 
              style={{ accentColor: 'var(--gold)' }} 
            />
            <span>Include Symbols</span>
          </label>
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginBottom: 20 }} onClick={handleGenerate}>
          Generate Password
        </button>

        {generatedPassword && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="input-label">Generated Result</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input 
                className="input" 
                readOnly 
                value={generatedPassword} 
                style={{ fontFamily: 'var(--font-mono)', textAlign: 'center' }}
              />
              <button className="btn btn-ghost" onClick={handleCopy}>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
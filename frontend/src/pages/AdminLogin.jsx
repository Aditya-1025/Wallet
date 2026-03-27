import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Key, UserCog, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate Secure Admin Authentication
    setTimeout(() => {
      // Hardcoded secure credential requirement for Admin Portal isolation
      if (formData.username === 'admin' && formData.password === 'admin123') {
        localStorage.setItem('smart-wallet-admin-token', 'secure-admin-session-xyz');
        navigate('/admin/dashboard');
      } else {
        setError("Invalid administrative credentials.");
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px' }}>
      <div className="glass-panel animate-slide-up" style={{ padding: '40px', borderTop: '4px solid var(--danger)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
            <ShieldAlert size={32} color="var(--danger)" />
          </div>
          <h2 style={{ color: 'white', margin: 0 }}>Admin Portal</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '14px' }}>Restricted Access Only</p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger)', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Admin Username</label>
            <div style={{ position: 'relative' }}>
              <UserCog size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="input-field" 
                style={{ paddingLeft: '40px', background: 'rgba(0,0,0,0.2)' }}
                placeholder="admin"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Security Key</label>
            <div style={{ position: 'relative' }}>
              <Key size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="input-field" 
                style={{ paddingLeft: '40px', background: 'rgba(0,0,0,0.2)' }}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-danger" style={{ width: '100%', padding: '12px', fontSize: '16px' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Authorize Access'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

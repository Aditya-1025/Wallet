import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Calendar, User, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { panService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PanScreen = () => {
  const [formData, setFormData] = useState({ panName: '', panNumber: '', dob: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { completePan, user } = useAuth();

  const handleInputChange = (e) => {
    // Auto capitalize PAN Number for UI polish
    const value = e.target.name === 'panNumber' ? e.target.value.toUpperCase() : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic client validation (match exactly 10 alphanumeric for Indian PAN)
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      setError("Invalid PAN format. Must be 10 characters (e.g., ABCDE1234F).");
      setLoading(false);
      return;
    }

    try {
      await panService.submitPan(formData.panName, formData.panNumber, formData.dob);

      // Mark PAN as verified locally in Context
      completePan();

      // Push to next stage (VKYC)
      navigate('/vkyc');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'PAN Verification failed. Please ensure details are correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centered-container">
      <div className="glass-panel auth-card animate-slide-up">
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(56, 189, 248, 0.1)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
            <CreditCard size={32} color="#38bdf8" />
          </div>
          <h2 className="gradient-text">PAN Verification</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Verify your Permanent Account Number to unlock video KYC.
          </p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger)', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Name on PAN Card</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                name="panName"
                className="input-field"
                style={{ paddingLeft: '40px' }}
                placeholder="As printed on card"
                value={formData.panName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>PAN Number</label>
            <div style={{ position: 'relative' }}>
              <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                name="panNumber"
                className="input-field"
                style={{ paddingLeft: '40px', letterSpacing: '2px', fontWeight: 'bold' }}
                placeholder="ABCDE1234F"
                maxLength={10}
                value={formData.panNumber}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Date of Birth</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                type="date"
                name="dob"
                className="input-field"
                style={{ paddingLeft: '40px' }}
                value={formData.dob}
                onChange={handleInputChange}
                required
              />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Must exactly match PAN records.</p>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify PAN'}
            {!loading && <CheckCircle size={18} />}
          </button>
        </form>

      </div>
    </div>
  );
};

export default PanScreen;

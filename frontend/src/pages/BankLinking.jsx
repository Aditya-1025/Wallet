import React, { useState, useEffect } from 'react';
import {
    Building2,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    CreditCard,
    Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { walletService } from '../services/api';

const BankLinking = () => {
    const { user } = useAuth();
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Form state
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [status, setStatus] = useState(null);

    const fetchBanks = async () => {
        if (!user) return;
        try {
            setFetching(true);
            const data = await walletService.getLinkedBanks(user.id);
            setBanks(data);
        } catch (err) {
            console.error('Failed to fetch banks:', err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchBanks();
    }, [user]);

    const handleLinkBank = async (e) => {
        e.preventDefault();
        if (!bankName || !accountNumber || !ifsc) return;

        try {
            setLoading(true);
            await walletService.linkBank(user.id, { bankName, accountNumber, ifscCode: ifsc });
            await fetchBanks();
            setStatus('success');
            setTimeout(() => {
                setStatus(null);
                setShowForm(false);
                setBankName('');
                setAccountNumber('');
                setIfsc('');
            }, 2000);
        } catch (err) {
            console.error('Linking failed:', err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel"
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                <h3 style={{ margin: 0 }}>Linked Bank Accounts</h3>
                {!showForm && (
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-primary" 
                        onClick={() => setShowForm(true)} 
                        style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}
                    >
                        <Plus size={16} /> Link New Bank
                    </motion.button>
                )}
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        style={{
                            padding: '20px',
                            borderRadius: '15px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            marginBottom: '30px',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4 style={{ margin: 0 }}>Add Bank Account</h4>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                        </div>

                        <form onSubmit={handleLinkBank}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Bank Name</label>
                                    <select
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        className="input-field"
                                        required
                                    >
                                        <option value="" disabled style={{ background: '#1e293b' }}>Select Bank</option>
                                        <option value="State Bank of India" style={{ background: '#1e293b' }}>State Bank of India</option>
                                        <option value="HDFC Bank" style={{ background: '#1e293b' }}>HDFC Bank</option>
                                        <option value="ICICI Bank" style={{ background: '#1e293b' }}>ICICI Bank</option>
                                        <option value="Axis Bank" style={{ background: '#1e293b' }}>Axis Bank</option>
                                        <option value="Paytm Payments Bank" style={{ background: '#1e293b' }}>Paytm Payments Bank</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>IFSC Code</label>
                                    <input
                                        type="text"
                                        placeholder="SBIN0001234"
                                        value={ifsc}
                                        onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                                        className="input-field"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Account Number</label>
                                <input
                                    type="text"
                                    placeholder="Enter 12-16 digit account number"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <AnimatePresence>
                                {status === 'success' && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="status-badge success" 
                                        style={{ marginBottom: '20px' }}
                                    >
                                        <CheckCircle2 size={18} /> Bank Linked Successfully!
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={loading || !bankName || !accountNumber || !ifsc}
                                className="btn-primary"
                                style={{ width: '100%', padding: '14px' }}
                            >
                                {loading ? 'Processing...' : 'Verify & Link Bank'}
                            </motion.button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div layout style={{ display: 'grid', gap: '15px' }}>
                {fetching ? (
                    [1, 2].map(i => (
                        <div key={i} className="animate-pulse" style={{ height: '80px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}></div>
                    ))
                ) : banks.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ padding: '60px 40px', textAlign: 'center', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '20px' }}
                    >
                        <Building2 size={40} style={{ opacity: 0.2, marginBottom: '15px' }} />
                        <p style={{ color: 'var(--text-muted)' }}>No bank accounts linked yet.</p>
                    </motion.div>
                ) : (
                    banks.map((bank, index) => (
                        <motion.div 
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.01, borderColor: 'rgba(var(--primary-rgb), 0.2)' }}
                            key={bank.id} 
                            className="bank-card" 
                            style={{
                                padding: 'clamp(12px, 3vw, 20px)',
                                borderRadius: '15px',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 'clamp(8px, 2vw, 15px)',
                                width: '100%',
                                boxSizing: 'border-box',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ display: 'flex', gap: 'clamp(10px, 3vw, 20px)', alignItems: 'center', minWidth: 0, flex: 1 }}>
                                <div style={{ background: 'var(--primary)', padding: 'clamp(8px, 2vw, 12px)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.3)', flexShrink: 0 }}>
                                    <Building size={20} color="white" />
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: 'clamp(14px, 4vw, 16px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bank.bankName}</div>
                                    <div style={{ display: 'flex', gap: 'clamp(5px, 2vw, 10px)', marginTop: '4px', fontSize: 'clamp(11px, 3vw, 13px)', color: 'var(--text-muted)', flexWrap: 'wrap', minWidth: 0 }}>
                                        <span style={{ whiteSpace: 'nowrap' }}>A/C: •• {bank.accountNumber.slice(-4)}</span>
                                        <span style={{ whiteSpace: 'nowrap' }}>IFSC: {bank.ifscCode}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexShrink: 0 }}>
                                <div style={{ 
                                    padding: '4px 10px', 
                                    borderRadius: '20px', 
                                    background: 'rgba(16, 185, 129, 0.1)', 
                                    color: '#10b981', 
                                    fontSize: 'clamp(10px, 2.5vw, 11px)', 
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap'
                                }}>
                                    ACTIVE
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ marginTop: '30px', padding: '15px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', display: 'flex', gap: '12px', alignItems: 'center' }}
            >
                <AlertCircle size={16} color="var(--text-muted)" />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    You can link multiple accounts for deposits. Transfers between wallets will always use your Smart Wallet balance.
                </span>
            </motion.div>
        </motion.div >
    );
};

export default BankLinking;

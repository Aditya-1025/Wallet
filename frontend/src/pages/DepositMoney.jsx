import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    PlusCircle,
    Building2,
    ChevronRight,
    CheckCircle2,
    ArrowLeft,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { walletService, transactionService } from '../services/api';

const DepositMoney = () => {
    const { user } = useAuth();
    const { fetchWallet } = useWallet();
    const navigate = useNavigate();
    const [banks, setBanks] = useState([]);
    const [selectedBank, setSelectedBank] = useState(null);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success', 'error'

    useEffect(() => {
        const fetchBanks = async () => {
            if (!user) return;
            try {
                const data = await walletService.getLinkedBanks(user.id);
                setBanks(data);
                if (data.length > 0) setSelectedBank(data[0]);
            } catch (err) {
                console.error('Failed to fetch banks:', err);
            }
        };
        fetchBanks();
    }, [user]);

    const handleDeposit = async (e) => {
        e.preventDefault();
        if (!selectedBank || !amount || parseFloat(amount) <= 0) return;

        try {
            setLoading(true);
            await transactionService.deposit(user.id, parseFloat(amount), `Deposit from ${selectedBank.bankName}`);
            await fetchWallet();
            setStatus('success');
            setTimeout(() => setStatus(null), 3000);
            setAmount('');
        } catch (err) {
            console.error('Deposit failed:', err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    if (banks.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel"
                style={{ padding: '40px', textAlign: 'center' }}
            >
                <Building2 size={48} style={{ opacity: 0.3, marginBottom: '20px' }} />
                <h3>No Bank Account Linked</h3>
                <p style={{ color: 'var(--text-muted)', margin: '15px 0 25px' }}>
                    You need to link a bank account before you can add money to your wallet.
                </p>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary"
                    onClick={() => navigate('/wallet/bank')}
                >
                    Link Bank Account
                </motion.button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel"
        >
            <h3 style={{ marginBottom: '25px' }}>Add Money to Wallet</h3>

            <form onSubmit={handleDeposit}>
                <div className="form-group">
                    <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Select Source Bank</label>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {banks.map(bank => (
                            <motion.div
                                whileHover={{ x: 5 }}
                                whileTap={{ scale: 0.99 }}
                                key={bank.id}
                                onClick={() => setSelectedBank(bank)}
                                className={`bank-select-item ${selectedBank?.id === bank.id ? 'selected' : ''}`}
                            >
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px' }}>
                                        <Building2 size={20} color={selectedBank?.id === bank.id ? 'var(--primary)' : 'var(--text-muted)'} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{bank.bankName}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>•••• {bank.accountNumber.slice(-4)}</div>
                                    </div>
                                </div>
                                {selectedBank?.id === bank.id && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                        <CheckCircle2 size={18} color="var(--primary)" />
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Enter Amount (₹)</label>
                    <div className="input-amount-wrapper">
                        <span className="currency-symbol">₹</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <AnimatePresence>
                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="status-badge success"
                        >
                            <CheckCircle2 size={18} /> Money Added Successfully!
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="status-badge error"
                        >
                            <Info size={18} /> Transaction Failed. Please try again.
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || !amount || parseFloat(amount) <= 0}
                    className="btn-primary"
                    style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', justifyContent: 'center', gap: '10px' }}
                >
                    {loading ? <div className="spinner-small"></div> : <PlusCircle size={20} />}
                    Proceed to Add ₹{amount || '0'}
                </motion.button>
            </form>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ marginTop: '30px', padding: '20px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.1)' }}
            >
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Info size={18} color="var(--accent)" />
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        This is a simulated transaction. Funds will be deducted from your mock bank account and added instantly to your Smart Wallet.
                    </div>
                </div>
            </motion.div>

            <style>{`
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
            `}</style>
        </motion.div>
    );
};

export default DepositMoney;

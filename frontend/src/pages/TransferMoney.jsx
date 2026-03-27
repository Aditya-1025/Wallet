import React, { useState } from 'react';
import {
    Send,
    User,
    QrCode,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { transactionService } from '../services/api';

const TransferMoney = () => {
    const { user } = useAuth();
    const { wallet, fetchWallet } = useWallet();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Pre-fill from QR scan if parameters exist
    const [receiverId, setReceiverId] = useState(searchParams.get('receiverId') || searchParams.get('id') || '');
    const [receiverName, setReceiverName] = useState(searchParams.get('name') || '');

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success', 'error'
    const [errorMsg, setErrorMsg] = useState('');
    const isFromScan = searchParams.get('fromScan') === 'true';

    const handleTransfer = async (e) => {
        e.preventDefault();
        if (!receiverId || !amount || parseFloat(amount) <= 0) return;
        if (receiverId === user.id || receiverId === user.userId) {
            setStatus('error');
            setErrorMsg("You cannot transfer money to yourself.");
            return;
        }
        if (parseFloat(amount) > wallet?.balance) {
            setStatus('error');
            setErrorMsg("Insufficient balance in your wallet.");
            return;
        }

        try {
            setLoading(true);
            setStatus(null);
            await transactionService.transfer(user.id, receiverId, parseFloat(amount), description);
            await fetchWallet();
            setStatus('success');
            setAmount('');
            setReceiverId('');
            setReceiverName('');
            setDescription('');
        } catch (err) {
            console.error('Transfer failed:', err);
            setStatus('error');
            setErrorMsg(err.response?.data?.message || "Transfer failed. Please check the Receiver ID.");
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h3 style={{ margin: 0 }}>Send Money</h3>
                    {receiverName && (
                        <motion.p 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ margin: '5px 0 0', fontSize: '14px', color: 'var(--accent)', fontWeight: 600 }}
                        >
                            Paying: {receiverName}
                        </motion.p>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/wallet/scan')}
                        className="btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}
                    >
                        <QrCode size={16} /> Scan QR
                    </motion.button>
                </div>
            </div>

            <form onSubmit={handleTransfer}>
                <div className="form-group">
                    <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Receiver User ID</label>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="e.g. 9876543210@wallet"
                            value={receiverId}
                            onChange={(e) => setReceiverId(e.target.value)}
                            className="input-field"
                            style={{ 
                                paddingLeft: '45px',
                                borderColor: /^\d{10}@wallet$/.test(receiverId) ? 'var(--success)' : (receiverId && !isFromScan ? 'var(--warning)' : undefined)
                            }}
                        />
                         {/^\d{10}@wallet$/.test(receiverId) ? (
                            <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--success)', fontSize: '12px', fontWeight: 600 }}>
                                Valid VPA
                            </div>
                        ) : (receiverId && !isFromScan && (
                            <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--warning)', fontSize: '10px', fontWeight: 600 }}>
                                Use number@wallet
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Amount (₹)</label>
                    <div className="input-amount-wrapper">
                        <span className="currency-symbol">₹</span>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    {wallet && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Available: ₹{wallet.balance.toFixed(2)}</span>
                            {parseFloat(amount) > wallet.balance && <span style={{ color: 'var(--danger)' }}>Insufficient balance</span>}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Description (Optional)</label>
                    <input
                        type="text"
                        placeholder="What's this for?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="input-field"
                    />
                </div>

                <AnimatePresence>
                    {status === 'success' && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 25 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="status-badge success"
                        >
                            <CheckCircle2 size={20} /> Transfer Completed Successfully!
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 25 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="status-badge error"
                        >
                            <AlertCircle size={20} /> {errorMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={
                        loading || 
                        !receiverId || 
                        !amount || 
                        parseFloat(amount) > (wallet?.balance || 0) ||
                        (!isFromScan && !/^\d{10}@wallet$/.test(receiverId))
                    }
                    className="btn-primary"
                    style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', justifyContent: 'center', gap: '10px' }}
                >
                    {loading ? <div className="spinner-small"></div> : <Send size={20} />}
                    Send ₹{amount || '0'}
                </motion.button>
            </form>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ marginTop: '30px', padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(var(--primary-rgb), 0.1)', padding: '10px', borderRadius: '50%' }}>
                        <Smartphone size={18} color="var(--primary)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>P2P Instant Transfer</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Transfers are processed instantly via our secure internal ledger.
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default TransferMoney;

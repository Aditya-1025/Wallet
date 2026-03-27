import React, { useState, useEffect } from 'react';
import {
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCcw,
    Search,
    Filter,
    CreditCard,
    User,
    MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/api';

const TransactionHistory = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');

    const fetchHistory = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await transactionService.getHistory(user.id);
            setHistory(data);
        } catch (err) {
            console.error('Failed to fetch history:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [user]);

    const filteredHistory = history.filter(tx => {
        if (filter !== 'ALL' && tx.type !== filter) return false;
        if (search && !tx.description?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const listVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel" 
            style={{ overflow: 'visible' }}
        >
            <div className="tx-header">
                <h3 style={{ margin: 0 }}>Recent Activity</h3>
                <div className="tx-search-container">
                    <div className="search-bar">
                        <Search size={16} />
                        <input
                            placeholder="Search description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="tx-filters">
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['ALL', 'DEPOSIT', 'TRANSFER'].map(f => (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`filter-btn ${filter === f ? 'active' : ''}`}
                        >
                            {f}
                        </motion.button>
                    ))}
                </div>
                <motion.button 
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.4 }}
                    onClick={fetchHistory} 
                    className="refresh-btn"
                >
                    <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                </motion.button>
            </div>

            <motion.div 
                className="tx-list"
                variants={listVariants}
                initial="hidden"
                animate="visible"
            >
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                        <motion.div 
                            key={`skeleton-${i}`} 
                            className="animate-pulse skeleton-item"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        />
                    ))
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredHistory.length === 0 ? (
                            <motion.div 
                                key="empty-state"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="empty-state"
                            >
                                No transactions found.
                            </motion.div>
                        ) : (
                            filteredHistory.map(tx => (
                                <motion.div 
                                    layout
                                    key={tx.id} 
                                    variants={itemVariants}
                                    className="transaction-item"
                                >
                                    <div className="tx-main">
                                        <div className={`tx-icon ${tx.type === 'DEPOSIT' || (tx.type === 'TRANSFER' && tx.receiverUserId === user.id) ? 'income' : 'expense'}`}>
                                            {tx.type === 'DEPOSIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                        </div>
                                        <div className="tx-info">
                                            <div className="tx-description">{tx.description}</div>
                                            <div className="tx-date">
                                                {new Date(tx.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tx-amount-section">
                                        <div className={`tx-amount ${tx.type === 'DEPOSIT' || (tx.type === 'TRANSFER' && tx.receiverUserId === user.id) ? 'income' : ''}`}>
                                            {tx.type === 'DEPOSIT' || (tx.type === 'TRANSFER' && tx.receiverUserId === user.id) ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                        </div>
                                        <div className={`tx-status status-${tx.status.toLowerCase()}`}>
                                            {tx.status}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                )}
            </motion.div>

            <style>{`
                .tx-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                    gap: 15px;
                    flex-wrap: wrap;
                }
                .tx-search-container {
                    flex-grow: 1;
                    display: flex;
                    justify-content: flex-end;
                }
                .search-bar {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255,255,255,0.05);
                    padding: 8px 15px;
                    border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.1);
                    transition: all 0.3s;
                    max-width: 300px;
                    width: 100%;
                }
                .search-bar:focus-within {
                    border-color: var(--primary);
                    background: rgba(255,255,255,0.08);
                }
                .search-bar input {
                    background: none;
                    border: none;
                    color: white;
                    outline: none;
                    width: 100%;
                    font-size: 13px;
                }
                .tx-filters {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    align-items: center;
                }
                .filter-btn {
                    padding: 6px 16px;
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.05);
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 12px;
                    font-weight: 600;
                }
                .filter-btn.active {
                    background: var(--primary);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }
                .refresh-btn {
                    margin-left: auto;
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 5px;
                }
                .tx-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .transaction-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px;
                    border-radius: 12px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    gap: 12px;
                    transition: background 0.2s, border-color 0.2s;
                    width: 100%;
                    box-sizing: border-box;
                }
                .transaction-item:hover {
                    background: rgba(255,255,255,0.06);
                    border-color: rgba(var(--primary-rgb), 0.2);
                }
                .tx-main {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    min-width: 0;
                    flex: 1;
                }
                .tx-icon {
                    padding: 10px;
                    border-radius: 12px;
                    flex-shrink: 0;
                    display: flex;
                }
                .tx-icon.income { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .tx-icon.expense { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .tx-info {
                    min-width: 0;
                    flex: 1;
                }
                .tx-description {
                    font-weight: 600;
                    font-size: 14px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .tx-date {
                    font-size: 11px;
                    color: var(--text-muted);
                    margin-top: 2px;
                }
                .tx-amount-section {
                    text-align: right;
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    justify-content: center;
                }
                .tx-amount {
                    font-weight: bold;
                    font-size: 16px;
                    color: white;
                }
                .tx-amount.income { color: #10b981; }
                .tx-status {
                    font-size: 10px;
                    margin-top: 2px;
                    font-weight: 600;
                }
                .status-success { color: var(--accent); }
                .status-pending { color: var(--warning); }
                .status-failed { color: var(--danger); }
                .skeleton-item {
                    height: 70px;
                    background: rgba(255,255,255,0.02);
                    border-radius: 12px;
                }
                .empty-state {
                    padding: 60px 20px;
                    text-align: center;
                    color: var(--text-muted);
                    border: 1px dashed rgba(255,255,255,0.05);
                    border-radius: 15px;
                }
            `}</style>
        </motion.div>
    );
};

export default TransactionHistory;

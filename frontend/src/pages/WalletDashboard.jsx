import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  PlusCircle,
  Send,
  Building2,
  QrCode,
  Bell,
  X,
  UserCog
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import DepositMoney from './DepositMoney';
import TransferMoney from './TransferMoney';
import BankLinking from './BankLinking';
import TransactionHistory from './TransactionHistory';
import MyQRCode from './MyQRCode';
import ScanPay from './ScanPay';

const WalletDashboard = () => {
  const { wallet, loading, error, notifications, clearNotification } = useWallet();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isBaseRoute = location.pathname === '/wallet' || location.pathname === '/wallet/';

  if (loading && !wallet) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="splash-screen"
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '30px'
        }}
      >
        <motion.div
           animate={{ 
             scale: [1, 1.05, 1],
             filter: ['drop-shadow(0 0 20px rgba(var(--primary-rgb), 0.3))', 'drop-shadow(0 0 40px rgba(var(--primary-rgb), 0.6))', 'drop-shadow(0 0 20px rgba(var(--primary-rgb), 0.3))']
           }}
           transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
           style={{ width: '120px', height: '120px' }}
        >
           <img 
             src="/splash_logo.png" 
             alt="Smart Wallet" 
             style={{ width: '100%', height: '100%', objectFit: 'contain' }}
           />
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}
            className="gradient-text"
          >
            Smart Wallet
          </motion.h2>
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '1px' }}
          >
            Decrypting your secure vault...
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (error && !wallet) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel" 
        style={{ padding: '40px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}
      >
        <h2 style={{ color: 'var(--danger)' }}>System Alert</h2>
        <p style={{ marginTop: '10px' }}>{error}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
          <button className="btn-primary" onClick={() => window.location.reload()}>Retry</button>
          <button className="btn-primary" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}
            onClick={() => { logout(); navigate('/'); }}>
            Log Out &amp; Start Fresh
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="wallet-container">
      {/* Real-time Notifications Toast Layer */}
      <div style={{ position: 'fixed', top: '100px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnimatePresence>
          {notifications.map(notif => (
            <motion.div 
              key={notif.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="glass-panel" 
              style={{
                padding: '16px',
                minWidth: '300px',
                background: 'rgba(30, 41, 59, 0.9)',
                borderLeft: `4px solid ${notif.type === 'TRANSFER_RECEIVED' ? '#10b981' : 'var(--primary)'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '50%' }}>
                    <Bell size={18} className="animate-bounce" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px' }}>Transaction Alert</h4>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>{notif.message}</p>
                    {notif.amount && (
                      <p style={{ margin: '4px 0 0', fontWeight: 'bold', color: '#10b981' }}>+ ₹{notif.amount.toFixed(2)}</p>
                    )}
                  </div>
                </div>
                <button onClick={() => clearNotification(notif.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div 
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15
            }
          }
        }}
        className="dashboard-layout"
      >
        {/* Sidebar Nav */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, x: -30 },
            show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
          }}
          className="glass-panel dashboard-sidebar"
        >
          <div style={{ marginBottom: '30px' }}>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)' }}>My Balance</span>
            <motion.h2 
              layout
              className="gradient-text" 
              style={{ fontSize: 'clamp(24px, 5vw, 32px)', margin: '10px 0', fontWeight: 800 }}
            >
              ₹{wallet?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </motion.h2>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '20px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Spent this month</span>
              <span style={{ color: 'var(--accent)' }}>₹{wallet?.totalSent?.toFixed(2)}</span>
            </div>
          </div>

          <div className="nav-grid">
            {[
              { to: "/wallet", icon: History, label: "History", active: isBaseRoute },
              { to: "/wallet/deposit", icon: PlusCircle, label: "Add Money", active: location.pathname.includes('/deposit') },
              { to: "/wallet/transfer", icon: Send, label: "Transfer", active: location.pathname.includes('/transfer') },
              { to: "/wallet/scan", icon: QrCode, label: "Scan & Pay", active: location.pathname.includes('/scan') },
              { to: "/wallet/my-qr", icon: UserCog, label: "My QR", active: location.pathname.includes('/my-qr') },
              { to: "/wallet/bank", icon: Building2, label: "Banks", active: location.pathname.includes('/bank') },
            ].map((item, index) => (
              <motion.div
                key={item.to}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0 }
                }}
              >
                <Link to={item.to} className={`nav-item ${item.active ? 'active' : ''}`}>
                  <item.icon size={18} /> <span>{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 30 },
            show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
          }}
          className="content-area"
          style={{ minWidth: 0 }}
        >
          <Routes>
            <Route path="/" element={<TransactionHistory />} />
            <Route path="/deposit" element={<DepositMoney />} />
            <Route path="/transfer" element={<TransferMoney />} />
            <Route path="/bank" element={<BankLinking />} />
            <Route path="/scan" element={<ScanPay />} />
            <Route path="/my-qr" element={<MyQRCode />} />
          </Routes>
        </motion.div>
      </motion.div>

      <style>{`
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          border-radius: 12px;
          color: var(--text-muted);
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
          position: relative;
          overflow: hidden;
        }
        .nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: white;
          transform: translateX(5px);
        }
        .nav-item.active {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          box-shadow: 0 10px 20px -5px rgba(102, 126, 234, 0.4);
        }
        .animate-slide-in-right {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default WalletDashboard;

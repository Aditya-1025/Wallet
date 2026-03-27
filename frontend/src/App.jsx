import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Wallet, ShieldCheck, UserCog, LogOut, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';

// Lazy load components for performance
const AuthFlow = lazy(() => import('./pages/AuthFlow'));
const PanScreen = lazy(() => import('./pages/PanScreen'));
const VkycFlow = lazy(() => import('./pages/VkycFlow'));
const AdminPortal = lazy(() => import('./pages/AdminPortal'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const WalletDashboard = lazy(() => import('./pages/WalletDashboard'));

import PremiumLoader from './components/PremiumLoader';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 1.02, y: -10 }}
    transition={{ 
      duration: 0.4, 
      ease: [0.22, 1, 0.36, 1] 
    }}
    className="page-wrapper"
  >
    {children}
  </motion.div>
);

const ProtectedRoute = ({ children, requirePan = false }) => {
  const { user, panVerified } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requirePan && !panVerified) {
    return <Navigate to="/pan" replace />;
  }

  return children;
};

// Segregated Security Gate for Admin
const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('smart-wallet-admin-token');
  if (!token) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isActive = (path) => location.pathname.startsWith(path);

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="glass-panel navbar"
    >
      <Link to="/" className="navbar-brand">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '8px', borderRadius: '8px', display: 'flex' }}
        >
          <Wallet color="white" size={24} />
        </motion.div>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>Smart Wallet</span>
      </Link>

      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/vkyc" style={{ color: isActive('/vkyc') ? 'var(--accent)' : 'var(--text-muted)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }}>
              <ShieldCheck size={18} /> <span>VKYC</span>
            </Link>
            <Link to="/wallet" style={{ color: isActive('/wallet') ? 'var(--accent)' : 'var(--text-muted)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }}>
              <Wallet size={18} /> <span>Wallet</span>
            </Link>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout} 
              className="btn-danger" 
              style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <LogOut size={16} /> <span>Logout</span>
            </motion.button>
          </>
        ) : (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/auth" className="btn-primary" style={{ textDecoration: 'none' }}>Login / Register</Link>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

const Welcome = () => {
  const { user, kycApproved } = useAuth();
  
  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <motion.div 
      variants={containerVars}
      initial="hidden"
      animate="visible"
      style={{ textAlign: 'center', marginTop: '100px' }}
    >
      <motion.h1 variants={itemVars} className="gradient-text" style={{ fontSize: '56px', marginBottom: '20px', fontWeight: 800 }}>
        Smart Wallet 2.0
      </motion.h1>
      <motion.p variants={itemVars} style={{ color: 'var(--text-muted)', fontSize: '20px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>
        Next generation secure payments and instant KYC verification. Experience the future of decentralized finance today.
      </motion.p>
      <motion.div variants={itemVars} style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        {user ? (
          kycApproved ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/wallet" style={{ textDecoration: 'none' }} className="btn-primary">
                <Wallet size={20} /> Go to Wallet
              </Link>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/vkyc" style={{ textDecoration: 'none' }} className="btn-primary">
                <ShieldCheck size={20} /> Complete KYC
              </Link>
            </motion.div>
          )
        ) : (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/auth" style={{ textDecoration: 'none' }} className="btn-primary">
              <UserCog size={20} /> Get Started
            </Link>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Animated Routing Wrapper
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Welcome /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><AuthFlow /></PageTransition>} />

        <Route path="/pan" element={
          <ProtectedRoute>
            <PageTransition><PanScreen /></PageTransition>
          </ProtectedRoute>
        } />

        <Route path="/vkyc" element={
          <ProtectedRoute requirePan={true}>
            <PageTransition><VkycFlow /></PageTransition>
          </ProtectedRoute>
        } />

        <Route path="/admin" element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <PageTransition><AdminPortal /></PageTransition>
          </AdminProtectedRoute>
        } />

        <Route path="/wallet/*" element={
          <ProtectedRoute>
            <PageTransition><WalletDashboard /></PageTransition>
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <Router>
          <Navbar />
          <div className="page-container">
            <Suspense fallback={<PremiumLoader />}>
              <AnimatedRoutes />
            </Suspense>
          </div>
        </Router>
      </WalletProvider>
    </AuthProvider>
  );
}

export default App;

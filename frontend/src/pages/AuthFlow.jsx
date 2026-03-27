import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, AlertCircle, ArrowRight, KeyRound, CheckCircle, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService, walletService, vkycService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AuthFlow = () => {
  const [step, setStep] = useState(1); // 1 = Login/Reg, 2 = Verify Email, 3 = Reset Password
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPwd, setShowForgotPwd] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', mobileNumber: '', otp: '',
    newPassword: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tempUser, setTempUser] = useState(null);
  const navigate = useNavigate();
  const { login, completePan, approveKyc } = useAuth();
  const audioRef = React.useRef(new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-click-1112.mp3'));

  const primeAudio = () => {
    // Mobile browsers require a user interaction to "unlock" audio.
    // Priming the audio on the initial click allows it to play later after async calls.
    const audio = audioRef.current;
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
    }).catch(() => { }); // Ignore if already primed or fails
  };

  const playSuccessSound = () => {
    const audio = audioRef.current;
    audio.play().catch(e => console.log('Audio play blocked:', e));
  };


  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let userData;
      if (isLogin) {
        userData = await authService.login(formData.email, formData.password);
        completeLogin(userData);
      } else {
        if (!formData.name) throw new Error("Name is required");
        if (!formData.mobileNumber) throw new Error("Mobile Number is required");
        userData = await authService.register(formData.name, formData.email, formData.password, formData.mobileNumber);
        setTempUser(userData);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPwdSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await authService.forgotPassword(formData.email);
      setStep(3);
      setSuccess("Reset code sent to your email!");
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPwdSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword(formData.email, formData.otp, formData.newPassword);
      setSuccess("Password reset successful! Please login.");
      setStep(1);
      setIsLogin(true);
      setShowForgotPwd(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.verifyEmail(tempUser.email, formData.otp);
      completeLogin(tempUser);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      setLoading(false);
    }
  };

  const completeLogin = async (userData) => {
    try {
      login({
        id: userData.userId,
        email: userData.email,
        name: userData.name,
        mobileNumber: userData.mobileNumber
      });

      let isPanDone = false;
      let isKycDone = false;

      try {
        const wallet = await walletService.getDetails(userData.userId);
        if (wallet && wallet.id) {
          isPanDone = true;
          isKycDone = true;
        }
      } catch (err) {
        try {
          const vkyc = await vkycService.getStatus(userData.userId);
          if (vkyc) {
            isPanDone = true;
            if (vkyc.status === 'APPROVED') {
              isKycDone = true;
            }
          }
        } catch (vkycErr) { }
      }

      if (isKycDone) {
        playSuccessSound();
        completePan();
        approveKyc();
        setTimeout(() => navigate('/wallet'), 500);
      } else if (isPanDone) {
        playSuccessSound();
        completePan();
        setTimeout(() => navigate('/vkyc'), 500);
      } else {
        playSuccessSound();
        setTimeout(() => navigate('/pan'), 500);
      }
    } catch (err) {
      setError('Failed to fetch user status.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: isLogin ? -20 : 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { staggerChildren: 0.1 }
    },
    exit: { opacity: 0, x: isLogin ? 20 : -20 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="centered-container" style={{ position: 'relative' }}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel auth-card"
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <motion.div
            initial={{ scale: 0.5, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            style={{ display: 'inline-flex', background: 'rgba(99, 102, 241, 0.1)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}
          >
            <Shield size={32} color="var(--primary)" />
          </motion.div>
          <motion.h2
            key={showForgotPwd ? 'reset' : (isLogin ? 'login' : 'reg')}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="gradient-text"
          >
            {step === 2 ? 'Verify OTP' : (showForgotPwd ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account'))}
          </motion.h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            {step === 2
              ? `We sent a code to ${formData.email}`
              : (showForgotPwd ? 'Enter your email to receive a reset code' : (isLogin ? 'Securely access your Smart Wallet' : 'Start your secure journey today'))}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {success && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ background: 'var(--success)', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', overflow: 'hidden' }}
            >
              <CheckCircle size={16} /> {success}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ background: 'var(--danger)', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', overflow: 'hidden' }}
            >
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="auth-form"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleAuthSubmit}
            >
              {!showForgotPwd && !isLogin && (
                <motion.div variants={itemVariants} className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      name="name"
                      className="input-field"
                      style={{ paddingLeft: '40px' }}
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}

              {!showForgotPwd && !isLogin && (
                <motion.div variants={itemVariants} className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Mobile Number</label>
                  <div style={{ position: 'relative' }}>
                    <Smartphone size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type="tel"
                      name="mobileNumber"
                      className="input-field"
                      style={{ paddingLeft: '40px' }}
                      placeholder="9876543210"
                      pattern="[0-9]{10}"
                      maxLength="10"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    name="email"
                    className="input-field"
                    style={{ paddingLeft: '40px' }}
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </motion.div>

              {!showForgotPwd && (
                <motion.div variants={itemVariants} className="form-group" style={{ marginBottom: '30px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      name="password"
                      className="input-field"
                      style={{ paddingLeft: '40px' }}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {isLogin && (
                    <div style={{ textAlign: 'right', marginTop: '8px' }}>
                      <span
                        onClick={() => { setShowForgotPwd(true); setError(null); setSuccess(null); }}
                        style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer' }}
                      >
                        Forgot Password?
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                {showForgotPwd ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={(e) => { primeAudio(); handleForgotPwdSubmit(e); }}
                      className="btn-primary"
                      style={{ width: '100%' }}
                      disabled={loading}
                    >
                      {loading ? 'Sending Code...' : 'Send Reset Code'}
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => setShowForgotPwd(false)}
                      style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)', marginTop: '16px', cursor: 'pointer', fontSize: '14px' }}
                    >
                      Back to Login
                    </button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    onClick={primeAudio}
                    className="btn-primary"
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    {!loading && <ArrowRight size={18} />}
                  </motion.button>
                )}
              </motion.div>

              {!showForgotPwd && (
                <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <span
                    onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null); }}
                    style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {isLogin ? 'Register here' : 'Login here'}
                  </span>
                </motion.div>
              )}
            </motion.form>
          ) : step === 2 ? (
            <motion.form
              key="otp-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleOtpSubmit}
            >
              <div className="form-group" style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', textAlign: 'center' }}>Enter 6-Digit Verification Code</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={20} style={{ position: 'absolute', left: '12px', top: '16px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    name="otp"
                    maxLength={6}
                    className="input-field"
                    style={{ paddingLeft: '44px', fontSize: '24px', letterSpacing: '8px', textAlign: 'center' }}
                    placeholder="••••••"
                    value={formData.otp}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                onClick={primeAudio}
                className="btn-primary"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                disabled={loading}
              >
                {loading ? 'Verifying Code...' : 'Verify Email'}
                {!loading && <CheckCircle size={18} />}
              </motion.button>
            </motion.form>
          ) : (
            <motion.form
              key="reset-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleResetPwdSubmit}
            >
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Reset Code (OTP)</label>
                <input
                  type="text"
                  name="otp"
                  className="input-field"
                  placeholder="123456"
                  value={formData.otp}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  className="input-field"
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="input-field"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                onClick={primeAudio}
                className="btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Update Password'}
              </motion.button>
              <button
                type="button"
                onClick={() => { setStep(1); setShowForgotPwd(false); }}
                style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)', marginTop: '16px', cursor: 'pointer' }}
              >
                Back to Login
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuthFlow;

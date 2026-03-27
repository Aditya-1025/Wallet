import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('smart-wallet-user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [panVerified, setPanVerified] = useState(() => {
        return localStorage.getItem('smart-wallet-pan-verified') === 'true';
    });

    const [kycApproved, setKycApproved] = useState(() => {
        return localStorage.getItem('smart-wallet-kyc-approved') === 'true';
    });

    useEffect(() => {
        const syncProfile = async () => {
            if (user && user.id && !user.mobileNumber) {
                try {
                    const { authService } = await import('../services/api');
                    const fullProfile = await authService.getProfile(user.id);
                    const updatedUser = {
                        ...user,
                        mobileNumber: fullProfile.mobileNumber
                    };
                    setUser(updatedUser);
                    localStorage.setItem('smart-wallet-user', JSON.stringify(updatedUser));
                } catch (err) {
                    console.error("Failed to sync profile:", err);
                }
            }
        };
        syncProfile();
    }, [user]);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('smart-wallet-user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setPanVerified(false);
        setKycApproved(false);
        localStorage.removeItem('smart-wallet-user');
        localStorage.removeItem('smart-wallet-pan-verified');
        localStorage.removeItem('smart-wallet-kyc-approved');
    };

    const completePan = () => {
        setPanVerified(true);
        localStorage.setItem('smart-wallet-pan-verified', 'true');
    };

    const approveKyc = () => {
        setKycApproved(true);
        localStorage.setItem('smart-wallet-kyc-approved', 'true');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, panVerified, completePan, kycApproved, approveKyc }}>
            {children}
        </AuthContext.Provider>
    );
};

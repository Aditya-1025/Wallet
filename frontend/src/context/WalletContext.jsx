import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { useAuth } from './AuthContext';
import { walletService } from '../services/api';

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
    const { user } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const fetchWallet = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await walletService.getDetails(user.id);
            setWallet(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch wallet:', err);
            setError('Could not load wallet data');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchWallet();
        } else {
            setWallet(null);
        }
    }, [user, fetchWallet]);

    // WebSocket implementation
    useEffect(() => {
        if (!user || !user.id) return;

        // derive the WS endpoint relative to the API base URL or window origin
        const apiBase = import.meta.env.VITE_API_BASE_URL || '';
        const wsUrl = apiBase.startsWith('http') 
            ? apiBase.replace(/^http/, 'ws') + '/ws-wallet' 
            : '/ws-wallet';
            
        const socket = new SockJS(wsUrl);
        const stompClient = Stomp.over(socket);
        
        // Disable debug logging in production-like feel
        stompClient.debug = () => {};

        stompClient.connect({}, (frame) => {
            console.log('Connected to WebSocket for user:', user.id);
            
            // Subscribe to private wallet topic
            stompClient.subscribe(`/topic/wallet/${user.id}`, (message) => {
                const payload = JSON.parse(message.body);
                console.log('Real-time notification received:', payload);
                
                // Update local wallet state
                setWallet(prev => ({
                    ...prev,
                    balance: payload.balance,
                    totalReceived: payload.totalReceived,
                    totalSent: payload.totalSent
                }));

                // Add to transient notifications
                const newNotif = {
                    id: Date.now(),
                    message: payload.message,
                    type: payload.type,
                    amount: payload.amount,
                    timestamp: new Date().toISOString()
                };
                setNotifications(prev => [newNotif, ...prev].slice(0, 5));
            });
        }, (error) => {
            console.error('STOMP Connection Error:', error);
        });

        return () => {
            if (stompClient.connected) {
                stompClient.disconnect();
            }
        };
    }, [user]);

    const clearNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <WalletContext.Provider value={{ 
            wallet, 
            loading, 
            error, 
            fetchWallet, 
            notifications,
            clearNotification
        }}>
            {children}
        </WalletContext.Provider>
    );
};

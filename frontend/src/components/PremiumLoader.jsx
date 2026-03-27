import React from 'react';
import { motion } from 'framer-motion';

const PremiumLoader = () => {
    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'var(--bg-dark)',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 9999
        }}>
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                    scale: [0.8, 1.1, 1],
                    opacity: 1,
                    rotate: [0, 180, 360]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid var(--primary)',
                    borderRadius: '15px',
                    position: 'relative',
                    boxShadow: '0 0 20px rgba(var(--primary-rgb), 0.3)'
                }}
            >
                <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '-10px',
                        right: '-10px',
                        bottom: '-10px',
                        border: '2px solid var(--accent)',
                        borderRadius: '20px',
                        opacity: 0.3
                    }}
                />
            </motion.div>
            
            <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                    marginTop: '30px',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #fff 0%, var(--text-muted) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '2px'
                }}
            >
                SMART WALLET
            </motion.h2>
            
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '150px' }}
                transition={{ duration: 1, delay: 0.8 }}
                style={{
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
                    marginTop: '10px'
                }}
            />
        </div>
    );
};

export default PremiumLoader;

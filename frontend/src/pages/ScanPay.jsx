import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { QrCode, X, Camera, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ScanPay = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [isScannerStarted, setIsScannerStarted] = useState(false);
    const [scanStatus, setScanStatus] = useState("Initializing camera...");
    const scannerRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
        let html5QrCode = null;

        const initScanner = async () => {
            // Guard: Ensure the element exists in DOM
            const container = document.getElementById("reader");
            if (!container) {
                console.error("Scanner container 'reader' not found");
                return;
            }

            try {
                html5QrCode = new Html5Qrcode("reader");
                scannerRef.current = html5QrCode;

                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    },
                    (decodedText) => {
                        if (isMounted) {
                            handleScanSuccess(decodedText, html5QrCode);
                        }
                    },
                    (errorMessage) => {
                        // Silent failure for periodic scans
                    }
                );

                if (isMounted) {
                    setIsScannerStarted(true);
                    setScanStatus("Scanning for QR code...");
                } else {
                    // If unmounted during start, stop it immediately
                    await html5QrCode.stop();
                    html5QrCode.clear();
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Scanner initialization error:", err);
                    setError("Could not start camera. Please ensure permissions are granted.");
                    setScanStatus("Camera error");
                }
            }
        };

        initScanner();

        return () => {
            isMounted = false;
            if (scannerRef.current) {
                const scanner = scannerRef.current;
                if (scanner.isScanning) {
                    scanner.stop().then(() => {
                        scanner.clear();
                    }).catch(err => console.error("Scanner cleanup error:", err));
                }
            }
        };
    }, []);

    const handleScanSuccess = async (decodedText, scannerInstance) => {
        setScanStatus("Code detected! Processing...");
        try {
            // Stop scanning immediately on success to prevent multiple navigations
            if (scannerInstance && scannerInstance.isScanning) {
                await scannerInstance.stop();
                setScanStatus("Code verified!");
            }

            // Processing logic
            const trimmedText = decodedText.trim();
            
            // 1. URL pattern
            if (trimmedText.startsWith('http')) {
                const url = new URL(trimmedText);
                const id = url.searchParams.get('id') || url.searchParams.get('receiverId');
                const name = url.searchParams.get('name');
                if (id) {
                    navigate(`/wallet/transfer?receiverId=${id}&name=${encodeURIComponent(name || '')}&fromScan=true`);
                    return;
                }
            }

            // 2. VPA pattern (number@wallet)
            if (/^\d{10}@wallet$/.test(trimmedText)) {
                navigate(`/wallet/transfer?receiverId=${trimmedText}&fromScan=true`);
                return;
            }

            // 3. Mobile number pattern (10 digits)
            if (/^\d{10}$/.test(trimmedText)) {
                navigate(`/wallet/transfer?receiverId=${trimmedText}&fromScan=true`);
                return;
            }

            // 3. ID pattern (minimum 8 chars)
            if (trimmedText.length >= 8) {
                navigate(`/wallet/transfer?receiverId=${trimmedText}&fromScan=true`);
                return;
            }

            setError("Unrecognized QR format. Please scan a valid Smart Wallet code.");
            // Restart if it was a false positive/wrong format (optional, here we let user restart manually or UI stay showing error)
        } catch (e) {
            console.error("Scan processing error:", e);
            setError("Failed to process QR code.");
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel" 
            style={{ padding: '30px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(var(--primary-rgb), 0.1)', padding: '10px', borderRadius: '50%' }}>
                        <QrCode size={20} color="var(--primary)" />
                    </div>
                    <h3 style={{ margin: 0 }}>Scan & Pay</h3>
                </div>
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/wallet')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                    <X size={24} />
                </motion.button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '10px' }}>
                Position the receiver's QR code within the frame to pay instantly
            </p>
            <div style={{ marginBottom: '20px', fontSize: '13px', color: 'var(--primary)', fontWeight: 500 }}>
                {scanStatus}
            </div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                id="reader" 
                style={{
                    width: '100%',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '2px solid rgba(255,255,255,0.1)',
                    background: 'black'
                }}
            />

            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                            marginTop: '20px',
                            padding: '12px',
                            borderRadius: '10px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            fontSize: '13px'
                        }}
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ padding: '20px', borderRadius: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', textAlign: 'left' }}>
                        <Camera size={20} color="var(--primary)" />
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 600 }}>Enable Camera Access</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>We need camera permission to scan QR codes securely.</div>
                        </div>
                    </div>
                </motion.div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary"
                    onClick={() => window.location.reload()}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    <RefreshCw size={16} /> Restart Scanner
                </motion.button>
            </div>

            <style>{`
                #reader__scan_region {
                    background: transparent !important;
                }
                #reader__dashboard {
                    padding: 20px !important;
                    background: rgba(15, 23, 42, 0.8) !important;
                    color: white !important;
                }
                #reader__dashboard_section_csr button {
                    background: var(--primary) !important;
                    color: white !important;
                    border: none !important;
                    padding: 8px 16px !important;
                    border-radius: 8px !important;
                    cursor: pointer !important;
                    margin: 5px !important;
                }
                #reader__status_span {
                    color: var(--text-muted) !important;
                    font-size: 12px !important;
                }
                #reader video {
                    width: 100% !important;
                    border-radius: 20px !important;
                }
            `}</style>
        </motion.div>
    );
};
export default ScanPay;

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { Download, Share2, Copy, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MyQRCode = () => {
    const { user } = useAuth();
    const [copied, setCopied] = React.useState(false);

    const vpa = `${user?.mobileNumber || '0000000000'}@wallet`;

    // Format: http://<ip>:5173/transfer?receiverId={vpa}&name={userName}
    const qrValue = `${window.location.origin}/transfer?receiverId=${vpa}&name=${encodeURIComponent(user?.name || '')}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(vpa);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadQR = () => {
        const svg = document.getElementById('my-qr-code');
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width + 40;
            canvas.height = img.height + 100;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 20, 20);

            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 16px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(user?.name, canvas.width / 2, img.height + 50);
            ctx.font = '12px Inter, sans-serif';
            ctx.fillStyle = '#64748b';
            ctx.fillText(vpa, canvas.width / 2, img.height + 75);

            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `SmartWallet_QR_${user?.name.replace(/\s+/g, '_')}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel" 
            style={{ textAlign: 'center', margin: '0 auto' }}
        >
            <h3 style={{ marginBottom: '10px' }}>Your Personal QR</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '30px' }}>
                Others can scan this to pay you instantly
            </p>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '24px',
                    display: 'inline-block',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    marginBottom: '30px',
                    position: 'relative'
                }}
            >
                <QRCodeSVG
                    id="my-qr-code"
                    value={qrValue}
                    size={Math.min(window.innerWidth - 100, 220)}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                        src: "/logo192.png",
                        x: undefined,
                        y: undefined,
                        height: 40,
                        width: 40,
                        excavate: true,
                    }}
                />
            </motion.div>

            <div style={{ marginBottom: '30px' }}>
                <h4 style={{ margin: '0 0 5px' }}>{user?.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <code style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px', wordBreak: 'break-all' }}>
                        {vpa}
                    </code>
                    <motion.button 
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={handleCopy} 
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }}
                    >
                        {copied ? <CheckCircle2 size={16} color="#10b981" /> : <Copy size={16} />}
                    </motion.button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary" 
                    onClick={downloadQR} 
                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', fontSize: '13px' }}
                >
                    <Download size={18} /> Save Image
                </motion.button>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary" 
                    onClick={handleCopy}
                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', fontSize: '13px' }}
                >
                    <Share2 size={18} /> Share VPA
                </motion.button>
            </div>

            <p style={{ marginTop: '30px', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Powered by Smart Wallet Internal Ledger
            </p>
        </motion.div>
    );
};

export default MyQRCode;

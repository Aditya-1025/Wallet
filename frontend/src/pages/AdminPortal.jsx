import React, { useState, useEffect } from 'react';
import { vkycService } from '../services/api';
import { Users, CheckCircle, Clock, XCircle, ChevronRight, PlayCircle, Loader2 } from 'lucide-react';

const AdminPortal = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, approvedToday: 0, rejectedToday: 0 });
  const [pendingList, setPendingList] = useState([]);
  const [selectedVkyc, setSelectedVkyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, pendingData] = await Promise.all([
        vkycService.getAdminStats(),
        vkycService.getPending()
      ]);
      setStats(statsData);
      setPendingList(pendingData);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30s
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async () => {
    if (!selectedVkyc) return;
    setActionLoading(true);
    try {
      await vkycService.approve(selectedVkyc.id);
      setSelectedVkyc(null);
      fetchData(); // Refresh list and stats
    } catch (err) {
      console.error('Approval failed', err);
      alert('Approval failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVkyc) return;
    const reason = prompt("Enter rejection reason:", "Blurry video quality");
    if (reason === null) return; // cancelled

    setActionLoading(true);
    try {
      await vkycService.reject(selectedVkyc.id, 'admin', reason);
      setSelectedVkyc(null);
      fetchData(); // Refresh list and stats
    } catch (err) {
      console.error('Rejection failed', err);
      alert('Rejection failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="glass-panel" style={{ flex: 1, padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div className={colorClass} style={{ padding: '16px', borderRadius: '12px' }}>
        <Icon size={32} />
      </div>
      <div>
        <h3 style={{ fontSize: '28px', margin: 0 }}>{value}</h3>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '14px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 className="gradient-text" style={{ fontSize: '32px', marginBottom: '8px' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time VKYC metrics and pending review queue.</p>
      </div>

      {/* STATS ROW */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <StatCard title="Total VKYCs" value={stats.total} icon={Users} colorClass="bg-blue" />
        <StatCard title="Pending Review" value={stats.pending} icon={Clock} colorClass="bg-yellow" />
        <StatCard title="Approved Today" value={stats.approvedToday} icon={CheckCircle} colorClass="bg-green" />
        <StatCard title="Rejected Today" value={stats.rejectedToday} icon={XCircle} colorClass="bg-red" />
      </div>

      <style>{`
        .bg-blue { background: rgba(56, 189, 248, 0.1); color: #38bdf8; }
        .bg-yellow { background: rgba(250, 204, 21, 0.1); color: #facc15; }
        .bg-green { background: rgba(74, 222, 128, 0.1); color: #4ade80; }
        .bg-red { background: rgba(248, 113, 113, 0.1); color: #f87171; }
        .list-item {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .list-item:hover { background: rgba(255,255,255,0.03); }
        .list-item:last-child { border-bottom: none; }
        .active-item { background: rgba(102, 126, 234, 0.1) !important; border-left: 4px solid var(--primary); }
      `}</style>

      {/* MAIN LAYOUT */}
      <div style={{ display: 'flex', gap: '30px', minHeight: '500px' }}>
        
        {/* LEFT COLUMN: PENDING LIST */}
        <div className="glass-panel" style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="var(--warning)" /> Pending Applications
            </h3>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 10px', animation: 'spin 1s linear infinite' }} />
                Loading pending VKYCs...
              </div>
            ) : pendingList.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p>No pending applications to review.</p>
                <p style={{ fontSize: '13px', marginTop: '8px' }}>Great job clearing the queue!</p>
              </div>
            ) : (
              pendingList.map(vkyc => (
                <div 
                  key={vkyc.id} 
                  className={`list-item ${selectedVkyc?.id === vkyc.id ? 'active-item' : ''}`}
                  onClick={() => setSelectedVkyc(vkyc)}
                >
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{vkyc.userId}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                      Submitted: {new Date(vkyc.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <ChevronRight size={20} color="var(--text-muted)" />
                </div>
              ))
            )}
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        </div>

        {/* RIGHT COLUMN: REVIEW DETAIL */}
        <div className="glass-panel" style={{ flex: '2', padding: '30px', display: 'flex', flexDirection: 'column' }}>
          {!selectedVkyc ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
              <PlayCircle size={64} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
              <h3>Select an application from the queue to start reviewing.</h3>
            </div>
          ) : (
            <div className="animate-slide-up" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: '0 0 8px 0' }}>Review Profile</h2>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>User ID: {selectedVkyc.userId}</p>
                </div>
                <span className="badge badge-pending">UNDER REVIEW</span>
              </div>

              {/* VIDEO PLAYER */}
              <div style={{ background: '#000', borderRadius: '12px', flex: 1, position: 'relative', overflow: 'hidden', minHeight: '300px' }}>
                {selectedVkyc.videoFileName ? (
                  <video 
                    controls 
                    autoPlay 
                    src={`/api/v1/vkyc/video/${selectedVkyc.id}`} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    No video associated with this application.
                  </div>
                )}
              </div>

              {/* METADATA & ACTIONS */}
              <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.4)', padding: '20px', borderRadius: '12px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text-muted)' }}>Documents Uploaded (Mock)</p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <span style={{ fontSize: '13px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '4px' }}>PAN Card</span>
                    <span style={{ fontSize: '13px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '4px' }}>Aadhaar</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button onClick={handleReject} disabled={actionLoading} className="btn-danger" style={{ minWidth: '120px' }}>
                    Reject
                  </button>
                  <button onClick={handleApprove} disabled={actionLoading} className="btn-success" style={{ minWidth: '120px' }}>
                    {actionLoading ? 'Loading...' : 'Approve'}
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminPortal;

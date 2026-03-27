import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Video, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { vkycService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const VkycFlow = () => {
  const { user, approveKyc } = useAuth();
  const userId = user?.email || user?.id || '';
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [vkycId, setVkycId] = useState('');
  const [otp, setOtp] = useState('');
  const [serverOtp, setServerOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pollingStatus, setPollingStatus] = useState('UNDER_REVIEW');
  const [initCheckCompleted, setInitCheckCompleted] = useState(false);

  // Auto-Recovery: Skip to Status screen if VKYC already exists
  useEffect(() => {
    const checkExistingVkyc = async () => {
      try {
        setLoading(true);
        const statusData = await vkycService.getStatus(userId);

        if (statusData && statusData.id) {
          setVkycId(statusData.id);

          if (['UNDER_REVIEW', 'APPROVED', 'REJECTED'].includes(statusData.status)) {
            setPollingStatus(statusData.status);
            setStep(4); // fast-forward to the pending/approved view
          } else {
            // Still in progress: NOT_STARTED or VIDEO_PENDING
            if (statusData.otpVerified) {
              setStep(3); // Go straight to Video Upload
            } else {
              setStep(2); // Go to OTP verification
            }
          }
        }
      } catch (err) {
        // 404 is expected here—it means no VKYC exists yet. Do nothing.
      } finally {
        setLoading(false);
        setInitCheckCompleted(true);
      }
    };

    if (userId) checkExistingVkyc();
  }, [userId]);

  // Video Recording State
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Attach stream when video element mounts
  useEffect(() => {
    if (streamActive && videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [streamActive, mediaStream]);

  // Poll VKYC status when in step 4
  useEffect(() => {
    let interval;
    if (step === 4) {
      interval = setInterval(async () => {
        try {
          const statusData = await vkycService.getStatus(userId);
          setPollingStatus(statusData.status);

          if (statusData.status === 'APPROVED') {
            clearInterval(interval);
            approveKyc(); // Clear local state for KYC
            setTimeout(() => navigate('/wallet'), 2500);
          }
        } catch (err) {
          console.error('Polling error', err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [step, userId, navigate]);

  // Timer for recording
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } else {
      clearInterval(interval);
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  const startCamera = async () => {
    try {
      // Use identical constraints to original vanilla JS to ensure dummy camera works
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setMediaStream(stream);
      setStreamActive(true);
    } catch (err) {
      setError('Camera access denied or failed: ' + err.message);
      console.error(err);
    }
  };

  const handleInitiate = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError("User session lost. Please login again.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await vkycService.initiate(userId);
      setVkycId(res.vkycId);
      setServerOtp(res.otp);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate VKYC');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await vkycService.verifyOtp(vkycId, otp);
      setStep(3); // Skip local document upload for backend parity, go to video
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return;

    setChunks([]);
    const mediaRecorder = new MediaRecorder(videoRef.current.srcObject, {
      mimeType: 'video/webm;codecs=vp8,opus'
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        setChunks(prev => [...prev, e.data]);
      }
    };

    mediaRecorder.onstop = async () => {
      // Need to capture the local let to avoid stale state in closure
      // We will handle submission outside in handleVideoSubmission to ensure chunks are ready
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(200); // collect 200ms chunks
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Wait for the final chunk flush, then submit
      setTimeout(submitRecording, 500);
    }
  };

  const submitRecording = async () => {
    setLoading(true);
    stopCamera();

    try {
      // Small trick: since setChunks is async, we capture latest chunks from ref if needed.
      // But we mapped mediaRecorder.ondataavailable correctly.
      // Easiest is to wait a tiny bit then grab state implicitly via the chunks variable updated or directly fetching from the recorder.
      // Actually, we can rely on state if we build Blob in the next render cycle, but let's just use the current chunks array if it's updated, 
      // It's safer to use the onstop callback for blob creation, but for React we can assemble when the user clicks 'submit'.
    } catch (err) { }
    // To fix stale chunks issue in React, we use the functional update or ref.
  };

  const handleFinalSubmit = async (finalChunks) => {
    setLoading(true);
    setError(null);

    try {
      const blob = new Blob(finalChunks, { type: 'video/webm' });
      const reader = new FileReader();

      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        let base64data = reader.result;
        if (base64data.includes(',')) {
          base64data = base64data.split(',')[1];
        }

        const fileName = `${crypto.randomUUID()}_vkyc_${userId}_${Date.now()}.webm`;
        const fileSize = blob.size;

        await vkycService.submitVideo(vkycId, base64data, fileName, fileSize);
        setStep(4);
      };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit video');
    } finally {
      setLoading(false);
    }
  };

  // Safe wrapper to handle mediaRecorder stop and blob gathering together
  const handleStopAndSubmit = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = () => {
        // Gathering chunks from state isn't reliable here due to closure.
        // Let's use an array in the outer scope just for the recording session
      };
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Better chunk management using refs for reliability during recording
  const recordingChunksRef = useRef([]);

  const safeStartRecording = () => {
    if (!videoRef.current?.srcObject) return;
    recordingChunksRef.current = [];

    const mediaRecorder = new MediaRecorder(videoRef.current.srcObject, {
      mimeType: 'video/webm;codecs=vp8,opus'
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordingChunksRef.current.push(e.data);
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(); // Removed the 200ms timeslice to prevent chunk corruption
    setIsRecording(true);
  };

  const safeStopAndSubmit = () => {
    if (!mediaRecorderRef.current || !isRecording) {
      console.error("Stop failed: Invalid recorder state", { recorder: !!mediaRecorderRef.current, isRecording });
      return;
    }

    mediaRecorderRef.current.onstop = () => {
      console.log("MediaRecorder stopped. Chunks captured:", recordingChunksRef.current.length);
      if (recordingChunksRef.current.length === 0) {
        setError('No video data captured. Please ensure your camera is working correctly.');
        stopCamera();
        setIsRecording(false);
        return;
      }
      handleFinalSubmit(recordingChunksRef.current);
      stopCamera();
    };

    try {
      mediaRecorderRef.current.stop();
    } catch (err) {
      console.error("Error stopping recorder:", err);
      setError('Failed to stop recording. Details in console.');
    }
    setIsRecording(false);
  };

  return (
    <div className="centered-container">
      <div className="glass-panel auth-card animate-slide-up">
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 className="gradient-text">Complete Your VKYC</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Follow the steps to verify your identity</p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger)', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* STEP 1: INITIATE */}
        {step === 1 && (
          !initCheckCompleted ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 16px', color: 'var(--primary)' }} />
              <p>Checking your KYC status...</p>
            </div>
          ) : (
            <form className="animate-slide-up" onSubmit={handleInitiate}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Authenticated User ID</label>
                <div
                  className="input-field"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
                >
                  {userId}
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Initiating VKYC...' : 'Acknowledge & Start'}
              </button>
            </form>
          )
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 2 && (
          <form className="animate-slide-up" onSubmit={handleVerifyOtp}>
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '16px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Demo OTP received from backend:</p>
              <h3 style={{ fontSize: '24px', letterSpacing: '4px', color: 'var(--accent)', marginTop: '8px' }}>{serverOtp}</h3>
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Enter Verification Code</label>
              <input
                type="text"
                className="input-field"
                placeholder="6-digit code"
                autoComplete="off"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '8px' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        )}

        {/* STEP 3: VIDEO RECORDING */}
        {step === 3 && (
          <div className="animate-slide-up">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ color: 'var(--text-muted)' }}>Position your face inside the frame and read the instructions aloud when recording.</p>
            </div>

            <div style={{ position: 'relative', background: '#000', borderRadius: '12px', overflow: 'hidden', height: '340px', marginBottom: '20px' }}>
              {!streamActive ? (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Video size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
                  <button type="button" onClick={startCamera} className="btn-primary">Enable Camera Access</button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                  />

                  {isRecording && (
                    <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', padding: '4px 12px', borderRadius: '999px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', animation: 'pulse 1.5s infinite' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }}></div>
                      {recordingTime}s
                    </div>
                  )}

                  <style>{`
                    @keyframes pulse {
                      0% { opacity: 1; }
                      50% { opacity: 0.5; }
                      100% { opacity: 1; }
                    }
                  `}</style>
                </>
              )}
            </div>

            {streamActive && (
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                {!isRecording ? (
                  <button type="button" onClick={safeStartRecording} className="btn-danger" style={{ width: '100%' }}>
                    Start Recording
                  </button>
                ) : (
                  <button type="button" onClick={safeStopAndSubmit} className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Submitting Video...' : 'Stop & Finalize Submission'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: SUCCESS / POLLING */}
        {step === 4 && (
          <div className="animate-slide-up" style={{ textAlign: 'center', padding: '40px 0' }}>

            {pollingStatus === 'APPROVED' ? (
              <>
                <CheckCircle size={64} style={{ color: 'var(--success)', margin: '0 auto 20px' }} />
                <h3 style={{ fontSize: '24px', marginBottom: '12px', color: 'white' }}>KYC Approved!</h3>
                <p style={{ color: 'var(--success)', marginBottom: '30px', fontWeight: 'bold' }}>
                  Creating your Smart Wallet...
                </p>
                <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: 'var(--primary)' }} />
              </>
            ) : pollingStatus === 'REJECTED' ? (
              <>
                <AlertCircle size={64} style={{ color: 'var(--danger)', margin: '0 auto 20px' }} />
                <h3 style={{ fontSize: '24px', marginBottom: '12px', color: 'var(--danger)' }}>Application Rejected</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Your VKYC was rejected by the administrator. Please try again.
                </p>
                <button onClick={() => window.location.reload()} className="btn-primary" style={{ marginTop: '20px' }}>
                  Restart Process
                </button>
              </>
            ) : (
              <>
                <CheckCircle size={64} style={{ color: 'var(--success)', margin: '0 auto 20px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '24px', marginBottom: '12px', color: 'white' }}>Application Submitted!</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
                  Your VKYC video is pending admin review. Do not close this page. <br /> Your wallet will be created automatically once approved.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--warning)', marginBottom: '20px' }}>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Waiting for Admin Approval...</span>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '8px', display: 'inline-block' }}>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Tracking User ID</p>
                  <p style={{ margin: '4px 0 0', fontWeight: 'bold', color: 'white' }}>{userId}</p>
                </div>
              </>
            )}
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

      </div>
    </div>
  );
};

export default VkycFlow;

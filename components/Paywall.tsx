"use client";
import React, { useState } from 'react';

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export default function Paywall({ isOpen, onClose, sessionId }: PaywallProps) {
  const [step, setStep] = useState<'select' | 'verify'>('select');
  const [selectedPlan, setSelectedPlan] = useState<'accelerator' | 'premium' | null>(null);
  const [paymentId, setPaymentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleInitiatePayment = (plan: 'accelerator' | 'premium') => {
    const link = plan === 'premium' 
      ? process.env.NEXT_PUBLIC_INSTAMOJO_LINK_149 
      : process.env.NEXT_PUBLIC_INSTAMOJO_LINK_99;

    if (!link) {
      alert("Payment link not configured. Please contact support.");
      return;
    }

    setSelectedPlan(plan);
    // Open Instamojo in new tab
    window.open(link, '_blank');
    // Move to verification step
    setStep('verify');
    setError('');
  };

  const handleVerify = async () => {
    const cleanId = paymentId.trim().toUpperCase();
    
    if (!cleanId.startsWith('MOJO') || cleanId.length < 12) {
      setError('Invalid Payment ID. It must start with MOJO (e.g., MOJO1234567890).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          paymentId: cleanId,
          plan: selectedPlan
        }),
      });

      const data = await res.json();

      if (data.success) {
        onClose();
        // Redirect to dashboard with success flag to trigger UI update
        window.location.href = '/dashboard?payment=success'; 
      } else {
        setError(data.error || 'Verification failed. Please check your Payment ID.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '30px',
        maxWidth: '420px', width: '100%', textAlign: 'center',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
      }}>
        {step === 'select' ? (
          <>
            <h2 style={{ color: '#1A1A1A', marginBottom: '10px', fontSize: '22px' }}>🔒 Unlock Premium</h2>
            <p style={{ color: '#666', marginBottom: '25px', fontSize: '14px', lineHeight: '1.5' }}>
              Get AI Resume Rewrite, Unlimited Jobs & Career Roadmap.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button onClick={() => handleInitiatePayment('accelerator')} style={{
                padding: '16px', border: '2px solid #FF6B35', borderRadius: '12px',
                background: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'all 0.2s'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1A1A1A' }}>Career Accelerator</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>One-time • Lifetime Access</div>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '22px', color: '#FF6B35' }}>₹99</div>
              </button>

              <button onClick={() => handleInitiatePayment('premium')} style={{
                padding: '16px', border: '2px solid #0066CC', borderRadius: '12px',
                background: '#0066CC', color: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'all 0.2s'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Premium Monthly</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Cancel anytime</div>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '22px' }}>₹149</div>
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ color: '#1A1A1A', marginBottom: '10px', fontSize: '22px' }}>✅ Verify Payment</h2>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px', lineHeight: '1.5' }}>
              Payment completed? Enter the <strong>Payment ID</strong> (starts with MOJO) from your Instamojo receipt or SMS:
            </p>
            
            <input
              type="text"
              placeholder="MOJO1234567890"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value.toUpperCase())}
              style={{
                width: '100%', padding: '14px', marginBottom: '15px',
                border: '1px solid #ddd', borderRadius: '10px', fontSize: '16px', fontWeight: '600', 
                letterSpacing: '1px', boxSizing: 'border-box', outline: 'none'
              }}
            />

            {error && <p style={{ color: '#EF4444', fontSize: '13px', marginBottom: '15px', fontWeight: '500' }}>{error}</p>}

            <button onClick={handleVerify} disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
            }}>
              {loading ? 'Verifying...' : 'Unlock Premium'}
            </button>

            <button onClick={() => setStep('select')} style={{
              marginTop: '15px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline'
            }}>
              ← Back to plans
            </button>
          </>
        )}

        <button onClick={onClose} style={{
          marginTop: '20px', background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '13px'
        }}>
          Close
        </button>
      </div>
    </div>
  );
}
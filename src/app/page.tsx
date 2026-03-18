'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Zap, BarChart3, Target, Brain, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid #1a1a1f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="white" />
          </div>
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#f4f4f5', letterSpacing: '-0.5px' }}>Krato</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => router.push('/auth/signin')} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #3f3f46', backgroundColor: 'transparent', color: '#d4d4d8', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
            Sign In
          </button>
          <button onClick={() => router.push('/auth/signup')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', border: '1px solid rgba(124,58,237,0.3)', backgroundColor: 'rgba(124,58,237,0.1)', marginBottom: '24px' }}>
          <Brain size={14} color="#a78bfa" />
          <span style={{ fontSize: '13px', color: '#a78bfa', fontWeight: 500 }}>AI-Powered Marketing Intelligence</span>
        </div>

        <h1 style={{ fontSize: '56px', fontWeight: 800, color: '#f4f4f5', lineHeight: 1.1, letterSpacing: '-1.5px', maxWidth: '800px', marginBottom: '20px' }}>
          All your marketing data.{' '}
          <span style={{ background: 'linear-gradient(135deg, #7c3aed, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            One powerful dashboard.
          </span>
        </h1>

        <p style={{ fontSize: '18px', color: '#71717a', maxWidth: '560px', lineHeight: 1.6, marginBottom: '36px' }}>
          Connect Google Search Console, GA4, Google Ads, and Meta Ads. Get AI-powered insights, anomaly alerts, and competitor intelligence — all in one place.
        </p>

        <button onClick={() => router.push('/auth/signup')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 32px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', fontSize: '16px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}>
          Start Free <ArrowRight size={18} />
        </button>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '60px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: BarChart3, label: 'GSC + GA4 Analytics' },
            { icon: Target, label: 'Google & Meta Ads' },
            { icon: Brain, label: 'AI Insights & Forecasting' },
            { icon: Zap, label: 'Competitor Ad Spy' },
          ].map((f) => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: '1px solid #27272a', backgroundColor: '#18181b' }}>
              <f.icon size={16} color="#a78bfa" />
              <span style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: 500 }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #1a1a1f' }}>
        <span style={{ fontSize: '12px', color: '#52525b' }}>© 2026 Krato by Oltaflock AI. All rights reserved.</span>
      </div>
    </div>
  );
}

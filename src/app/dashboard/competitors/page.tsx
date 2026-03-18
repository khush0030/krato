'use client';
import { Eye, Plus, ExternalLink, Image, MessageSquare } from 'lucide-react';
import { PageShell, EmptyState } from '@/components/PageShell';

const mockCompetitors = [
  { name: 'Competitor A', domain: 'competitor-a.com', activeAds: 12, lastScan: '2h ago', status: 'active' },
  { name: 'Competitor B', domain: 'competitor-b.io', activeAds: 8, lastScan: '5h ago', status: 'active' },
  { name: 'Competitor C', domain: 'competitor-c.com', activeAds: 3, lastScan: '1d ago', status: 'paused' },
];

const mockAds = [
  { competitor: 'Competitor A', text: 'Automate your business with AI agents. 10x your productivity. Try free for 14 days.', platform: 'Facebook', impressions: '50K-100K', started: 'Mar 12', creative: 'image' },
  { competitor: 'Competitor A', text: 'Stop missing calls. Our AI receptionist handles everything 24/7.', platform: 'Instagram', impressions: '100K-200K', started: 'Mar 8', creative: 'video' },
  { competitor: 'Competitor B', text: 'The #1 AI automation platform for law firms. Book a demo today.', platform: 'Facebook', impressions: '10K-50K', started: 'Mar 15', creative: 'image' },
];

export default function CompetitorsPage() {
  return (
    <PageShell title="Competitor Spy" description="Track competitor ads & strategies" icon={Eye} badge="AD LIBRARY">
      {/* Add Competitor */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={16} /> Add Competitor
        </button>
      </div>

      {/* Competitor List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {mockCompetitors.map(c => (
          <div key={c.name} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#f4f4f5' }}>{c.name}</div>
                <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>{c.domain}</div>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', backgroundColor: c.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(113,113,122,0.1)', color: c.status === 'active' ? '#22c55e' : '#71717a' }}>
                {c.status}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#71717a' }}>Active Ads: <span style={{ color: '#f4f4f5', fontWeight: 600 }}>{c.activeAds}</span></span>
              <span style={{ color: '#52525b' }}>Scanned {c.lastScan}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Ad Feed */}
      <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5', marginBottom: '16px' }}>Latest Competitor Ads</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mockAds.map((ad, i) => (
            <div key={i} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #27272a', backgroundColor: '#1c1c1f' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#d4d4d8' }}>{ad.competitor}</span>
                  <span style={{ fontSize: '11px', color: '#52525b' }}>•</span>
                  <span style={{ fontSize: '11px', color: '#71717a' }}>{ad.platform}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {ad.creative === 'image' ? <Image size={12} color="#71717a" /> : <MessageSquare size={12} color="#71717a" />}
                  <span style={{ fontSize: '11px', color: '#52525b' }}>{ad.impressions}</span>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#a1a1aa', lineHeight: 1.5, marginBottom: '8px' }}>{ad.text}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#52525b' }}>Started {ad.started}</span>
                <button style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer' }}>
                  View Landing Page <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

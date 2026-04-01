'use client';
import { GitBranch } from 'lucide-react';
import { PageShell, EmptyState } from '@/components/PageShell';

export default function AttributionPage() {
  return (
    <PageShell title="Attribution" description="Understand which channels drive conversions" icon={GitBranch}>
      <EmptyState
        icon={GitBranch}
        title="Attribution coming soon"
        description="Multi-touch attribution modeling is on the roadmap. Connect GA4, Meta Ads, and Google Ads to enable cross-channel attribution when it launches."
      />
    </PageShell>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from '../../lib/useIsMobile';
import { adminApi } from '../../lib/api';
import { CanvasHead } from '../../components/layout/CanvasHead';
import { Tag } from 'lucide-react';

interface Category { _id: string; name: string; icon?: string; issueCount?: number; }

const CAT_ICONS: Record<string, string> = {
  pothole: '🕳', streetlight: '💡', garbage: '🗑',
  water: '💧', drainage: '🌊', power: '⚡', other: '📌',
};
const CAT_COLORS: Record<string, string> = {
  pothole: 'oklch(0.40 0.12 50)',   streetlight: 'oklch(0.45 0.14 75)',
  garbage: 'oklch(0.42 0.12 150)',  water: 'oklch(0.42 0.12 220)',
  drainage: 'oklch(0.42 0.12 250)', power: 'oklch(0.50 0.18 28)',
  other: 'oklch(0.45 0.12 300)',
};
const CAT_BG: Record<string, string> = {
  pothole: 'oklch(0.92 0.05 60)',   streetlight: 'oklch(0.92 0.07 90)',
  garbage: 'oklch(0.92 0.05 145)',  water: 'oklch(0.92 0.05 220)',
  drainage: 'oklch(0.92 0.05 250)', power: 'oklch(0.92 0.06 30)',
  other: 'oklch(0.92 0.04 300)',
};

export function AdminCategories() {
  const qc = useQueryClient();
  const isMobile = useIsMobile();
  const { data = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => adminApi.listCategories().then((r) => r.data),
  });

  const toggleMut = useMutation({
    mutationFn: (id: string) => adminApi.updateCategory(id, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });

  return (
    <div style={{ padding: isMobile ? '16px 16px 80px' : 'clamp(24px, 4vw, 40px)' }}>
      <CanvasHead
        eyebrow="Admin · Categories"
        title={<>Issue <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>categories</em></>}
        subtitle={`${data.length} categories configured`}
      />

      {isLoading ? (
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-3)' }}>Loading…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {data.map((cat) => {
            const key = cat.name.toLowerCase().replace(/\s+/g, '_');
            const icon = CAT_ICONS[key] ?? cat.icon ?? '📌';
            const color = CAT_COLORS[key] ?? 'var(--ink-2)';
            const bg    = CAT_BG[key]    ?? 'var(--bg)';
            return (
              <div key={cat._id} style={{
                background: 'var(--paper)', borderRadius: 'var(--radius-card)',
                padding: '20px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--line)',
                display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem',
                }}>
                  {icon}
                </div>
                <div>
                  <p style={{
                    fontFamily: 'var(--font-sans)', fontWeight: 700,
                    fontSize: '0.9rem', color: 'var(--ink)', margin: '0 0 2px',
                    textTransform: 'capitalize',
                  }}>
                    {cat.name.replace(/_/g, ' ')}
                  </p>
                  {cat.issueCount !== undefined && (
                    <p style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                      color, margin: 0, letterSpacing: '0.06em',
                    }}>
                      {cat.issueCount} issues
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {data.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}>
              <Tag size={32} style={{ color: 'var(--ink-3)', marginBottom: 12 }} />
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-3)', margin: 0 }}>
                No categories configured.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

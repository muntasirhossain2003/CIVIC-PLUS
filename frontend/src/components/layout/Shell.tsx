import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ overflowY: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}

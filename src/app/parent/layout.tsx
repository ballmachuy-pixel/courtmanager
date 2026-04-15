import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cổng Phụ Huynh | Sunday - Sunset',
  description: 'Theo dõi điểm danh và học phí của học viên.',
};

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'var(--color-bg-secondary)', padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--color-primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
            C
          </div>
          <span style={{ fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>Sunday - Sunset <span className="text-muted" style={{ fontWeight: 'normal' }}>| Dành cho phụ huynh</span></span>
        </div>
      </header>

      <main style={{ flex: 1, padding: 'var(--space-6) var(--space-4)' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {children}
        </div>
      </main>

      <footer style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', borderTop: '1px solid var(--color-border)' }}>
        Hệ thống quản lý Sunday - Sunset Academy.
      </footer>
    </div>
  );
}

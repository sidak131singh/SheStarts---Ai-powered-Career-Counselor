'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';

const NAV_ITEMS = [
  { href: '/dashboard',  label: 'Dashboard',   icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/results',    label: 'Career Paths', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { href: '/score',      label: 'My Score',     icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { href: '/roadmap',    label: 'Roadmap',      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { href: '/counselor',  label: 'AI Counselor', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', dot: true },
  { href: '/progress',   label: 'Progress',     icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  { href: '/resume',     label: 'Resume',       icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { name, email, isAuthenticated, loadFromStorage, isLoading, logout } = useUserStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { loadFromStorage(); }, [loadFromStorage]);

  const displayName = name || email?.split('@')[0] || 'User';
  const initials    = displayName.slice(0, 2).toUpperCase();

  const handleLogout = () => { logout(); router.push('/'); };

  const sidebarBg = '#0B3540';
  const activeBg  = '#E2D400';
  const hoverBg   = 'rgba(226,212,0,0.08)';

  return (
    <div style={{ minHeight: '100vh', background: '#F0F4F4', display: 'flex', fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 30 }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed', left: 0, top: 0, height: '100%', width: 240,
        background: sidebarBg, zIndex: 40, display: 'flex', flexDirection: 'column',
        transition: 'transform 0.3s', transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
        className="lg:translate-x-0"
      >
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.4rem', lineHeight: 1 }}>
              <span style={{ color: '#00C4BA' }}>SHE</span><span style={{ color: '#E2D400' }}>STARTS</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', marginTop: 2 }}>CAREER COMPASS</div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6,
                  background: isActive ? activeBg : 'transparent',
                  color: isActive ? '#0B3540' : 'rgba(255,255,255,0.7)',
                  textDecoration: 'none', fontWeight: isActive ? 800 : 700, fontSize: '0.82rem',
                  letterSpacing: '0.04em', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = hoverBg; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
                {item.dot && (
                  <span style={{ marginLeft: 'auto', width: 7, height: 7, background: '#22C55E', borderRadius: '50%' }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: '#E2D400', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B3540', fontWeight: 900, fontSize: '0.8rem', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
              {email && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</p>}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ width: '100%', marginTop: 10, fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '0.04em', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, transition: 'color 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#E57373'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)'; }}
          >
            SIGN OUT
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="lg:ml-60">
        {/* Mobile top bar */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 56, background: sidebarBg, borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 20 }} className="lg:hidden">
          <button onClick={() => setSidebarOpen(true)} style={{ padding: 8, color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.1rem' }}>
            <span style={{ color: '#00C4BA' }}>SHE</span><span style={{ color: '#E2D400' }}>STARTS</span>
          </div>
          <div style={{ width: 32, height: 32, background: '#E2D400', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B3540', fontWeight: 900, fontSize: '0.7rem' }}>
            {initials}
          </div>
        </header>

        <main style={{ flex: 1 }}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
              <div style={{ width: 36, height: 36, border: '3px solid #0B3540', borderTopColor: '#E2D400', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : children}
        </main>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          aside { transform: translateX(0) !important; }
          .lg\\:ml-60 { margin-left: 240px !important; }
          header.lg\\:hidden { display: none !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

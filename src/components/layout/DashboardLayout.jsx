// layouts/AdminLayout.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { adminGet, logoutUser } from '../../services/adminApi';
import { adminSidebarOptions } from '../../content/dashboard/sidebar';

/* ─────────────────────────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; }

.al-shell {
  display: flex; height: 100vh; overflow: hidden;
  font-family: 'IBM Plex Sans', sans-serif;
  background: #f5f5f5;
}

/* ── Sidebar ── */
.al-sidebar {
  width: 220px; flex-shrink: 0;
  background: #fff;
  display: flex; flex-direction: column;
  height: 100vh; overflow: hidden;
  position: fixed; left: 0; top: 0; z-index: 200;
  transition: transform .22s cubic-bezier(.4,0,.2,1);
  border-right: 1px solid #e5e7eb;
}

.al-brand {
  padding: 15px 13px 13px;
  border-bottom: 1px solid #f0f0f0;
  display: flex; align-items: center; gap: 9px;
}
.al-brand-icon {
  width: 28px; height: 28px; border-radius: 6px;
  background: #1558b0; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.al-brand-name {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px; font-weight: 600;
  color: #111827; letter-spacing: -.2px; line-height: 1.2;
}
.al-brand-env {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; color: #9ca3af;
  text-transform: uppercase; letter-spacing: .9px; margin-top: 1px;
}
.al-refresh-btn {
  margin-left: auto; background: none; border: none;
  color: #9ca3af; cursor: pointer; padding: 4px 4px 2px; border-radius: 4px;
  display: flex; align-items: center; transition: color .12s;
}
.al-refresh-btn:hover { color: #6b7280; }

/* Mini stats */
.al-stats {
  padding: 9px 11px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 5px;
  border-bottom: 1px solid #f0f0f0;
}
.al-stat {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 7px; padding: 7px 8px;
}
.al-stat-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 8.5px; text-transform: uppercase; letter-spacing: .8px;
  color: #9ca3af; margin-bottom: 4px;
  display: flex; align-items: center; gap: 4px;
}
.al-stat-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.al-stat-value {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 15px; font-weight: 600; color: #111827; line-height: 1;
}
.al-stat-sub {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 8.5px; color: #9ca3af; margin-top: 3px;
}
@keyframes al-shimmer { to { background-position: -200% 0; } }
.al-stat.loading .al-stat-value {
  display: inline-block; width: 32px; height: 12px; border-radius: 3px;
  background: linear-gradient(90deg,#f0f0f0 25%,#e5e7eb 50%,#f0f0f0 75%);
  background-size: 200% 100%; animation: al-shimmer 1.3s infinite;
}
@keyframes al-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.7);opacity:.4} }
.al-stat-dot.pulse { animation: al-pulse 2s ease infinite; }

/* Nav */
.al-nav { flex: 1; overflow-y: auto; padding: 6px 9px; scrollbar-width: none; }
.al-nav::-webkit-scrollbar { display: none; }

.al-nav-section {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 8.5px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 1.1px;
  color: #9ca3af; padding: 10px 5px 5px;
}
.al-nav-link {
  display: flex; align-items: center; gap: 9px;
  padding: 7px 9px; border-radius: 6px;
  font-size: 12.5px; font-weight: 500; color: #6b7280;
  text-decoration: none; transition: all .12s;
  margin-bottom: 1px; border: 1px solid transparent;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.al-nav-link:hover { color: #111827; background: #f5f5f5; }
.al-nav-link.active {
  color: #1558b0;
  background: #eff6ff;
  border-color: #bfdbfe;
}
.al-nav-icon {
  width: 15px; height: 15px; flex-shrink: 0;
  opacity: .35; transition: opacity .12s;
}
.al-nav-link:hover .al-nav-icon { opacity: .6; filter: none; }
.al-nav-link.active .al-nav-icon { opacity: 1; filter: none; }
.al-nav-badge {
  margin-left: auto; flex-shrink: 0;
  background: #ea580c; color: #fff;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; font-weight: 700;
  padding: 1px 6px; border-radius: 9px; min-width: 18px; text-align: center;
}

/* Footer */
.al-footer { padding: 9px 9px 13px; border-top: 1px solid #f0f0f0; }
.al-logout {
  width: 100%; display: flex; align-items: center; gap: 9px;
  padding: 8px 10px; border-radius: 6px;
  font-size: 12px; font-weight: 600; color: #ef4444;
  background: #fff5f5; border: 1px solid #fecaca;
  cursor: pointer; transition: all .12s; font-family: 'IBM Plex Sans', sans-serif;
}
.al-logout:hover { background: #fee2e2; border-color: #fca5a5; }

/* ── Body ── */
.al-body { display: flex; flex-direction: column; flex: 1; overflow: hidden; margin-left: 220px; }

/* ── Topbar ── */
.al-topbar {
  height: 50px; background: #fff;
  border-bottom: 1.5px solid #e5e7eb;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 18px; flex-shrink: 0;
}
.al-topbar-l { display: flex; align-items: center; gap: 10px; }
.al-hamburger {
  display: none; width: 32px; height: 32px; border-radius: 6px;
  border: 1.5px solid #e5e7eb; background: transparent;
  align-items: center; justify-content: center;
  cursor: pointer; color: #374151; transition: background .12s; flex-shrink: 0;
}
.al-hamburger:hover { background: #f9fafb; }
.al-breadcrumb { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #9ca3af; }
.al-breadcrumb b { color: #111827; font-weight: 600; }
.al-topbar-r { display: flex; align-items: center; gap: 8px; }
.al-clock {
  font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; color: #9ca3af;
  background: #f9fafb; border: 1px solid #e5e7eb;
  padding: 3px 9px; border-radius: 5px;
}
.al-pip {
  display: flex; align-items: center; gap: 5px;
  font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #9ca3af;
}
.al-pip-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; }

/* ── Content ── */
.al-content { flex: 1; overflow-y: auto; }

/* ── Overlay ── */
.al-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.25); z-index: 190; backdrop-filter: blur(1px); }
.al-overlay.show { display: block; }

/* ── Mobile ── */
@media (max-width: 1023px) {
  .al-sidebar { transform: translateX(-100%); }
  .al-sidebar.open { transform: translateX(0); }
  .al-body { margin-left: 0; }
  .al-hamburger { display: flex; }
}
`;

/* Icons */
const IcoActivity = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IcoMenu = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IcoX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IcoLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IcoRefresh = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.08-9.16"/>
  </svg>
);

/* LiveClock */
function LiveClock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const tick = () => setT(
      new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true, timeZone: 'Asia/Kolkata',
      }) + ' IST'
    );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="al-clock">{t}</span>;
}

/* MiniStat */
function MiniStat({ label, value, dotColor, sub, loading, pulse }) {
  const isRupee = label === 'Volume';
  const fmt = (n) => {
    if (typeof n !== 'number') return '—';
    if (isRupee) {
      if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
      if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
      return `₹${n}`;
    }
    return n.toLocaleString('en-IN');
  };
  return (
    <div className={`al-stat${loading ? ' loading' : ''}`}>
      <div className="al-stat-label">
        <span className={`al-stat-dot${pulse ? ' pulse' : ''}`} style={{ background: dotColor }} />
        {label}
      </div>
      <div className="al-stat-value">{loading ? '' : fmt(value)}</div>
      {sub && <div className="al-stat-sub">{sub}</div>}
    </div>
  );
}

/* ═══════════════════ LAYOUT ═══════════════════ */
export default function AdminLayout({ role }) {
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [stats, setStats]               = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const location = useLocation();

  const currentPage = adminSidebarOptions.find(o => o.nav === location.pathname)?.title ?? 'Dashboard';

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await adminGet('/dashboard/stats');
      if (res?.success) setStats(res.stats);
    } catch (e) { console.error(e); }
    finally { setStatsLoading(false); }
  }, []);

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 120_000);
    return () => clearInterval(id);
  }, [fetchStats]);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const today        = stats?.today ?? null;
  const pendingCount = today?.pending ?? 0;

  return (
    <>
      <style>{STYLES}</style>

      <div className={`al-overlay${sidebarOpen ? ' show' : ''}`} onClick={() => setSidebarOpen(false)} />

      <div className="al-shell">

        {/* ──────── SIDEBAR ──────── */}
        <aside className={`al-sidebar${sidebarOpen ? ' open' : ''}`}>

          <div className="al-brand">
            <div className="al-brand-icon"><IcoActivity /></div>
            <div>
              <div className="al-brand-name">Admin Panel</div>
              <div className="al-brand-env">FsQuickPay</div>
            </div>
            <button className="al-refresh-btn" onClick={fetchStats} title="Refresh"><IcoRefresh /></button>
          </div>

          <div className="al-stats">
            <MiniStat label="Pending" value={today?.pending}   dotColor="#f97316" sub="Today"      loading={statsLoading} pulse={pendingCount > 0} />
            <MiniStat label="Success" value={today?.success}   dotColor="#22c55e" sub="Today"      loading={statsLoading} />
            <MiniStat label="Volume"  value={today?.totalFiat} dotColor="#3b82f6" sub="Fiat today" loading={statsLoading} />
            <MiniStat label="Failed"  value={today?.failed}    dotColor="#ef4444" sub="Today"      loading={statsLoading} />
          </div>

          <nav className="al-nav">
            <div className="al-nav-section">Navigation</div>
            {adminSidebarOptions.map((opt, i) => (
              <Link
                key={i}
                to={opt.nav}
                className={`al-nav-link${location.pathname === opt.nav ? ' active' : ''}`}
              >
                {opt.icon && <img src={opt.icon} alt="" className="al-nav-icon" />}
                {opt.title}
                {opt.title?.toLowerCase().includes('order') && pendingCount > 0 && (
                  <span className="al-nav-badge">{pendingCount}</span>
                )}
              </Link>
            ))}
          </nav>

          <div className="al-footer">
            <button className="al-logout" onClick={() => logoutUser()}>
              <IcoLogout /> Sign out
            </button>
          </div>
        </aside>

        {/* ──────── BODY ──────── */}
        <div className="al-body">
          <header className="al-topbar">
            <div className="al-topbar-l">
              <button className="al-hamburger" onClick={() => setSidebarOpen(p => !p)} aria-label="Toggle menu">
                {sidebarOpen ? <IcoX /> : <IcoMenu />}
              </button>
              <div className="al-breadcrumb">Admin&nbsp;/&nbsp;<b>{currentPage}</b></div>
            </div>
            <div className="al-topbar-r">
              <div className="al-pip"><span className="al-pip-dot" />Live</div>
              <LiveClock />
            </div>
          </header>

          <main className="al-content">
            <Outlet />
          </main>
        </div>

      </div>
    </>
  );
}
// pages/admin/Dashboard.jsx
// Fetches stats from GET /admin/dashboard/stats and renders them in stat cards.
// Matches the IBM Plex Mono / IBM Plex Sans aesthetic of the Orders page.

import React, { useEffect, useState, useCallback } from 'react';
import { adminGet } from '../../services/adminApi';

/* ─── Helpers ─────────────────────────────────────────────────────── */
const fmt = (n) =>
  typeof n === 'number'
    ? n % 1 === 0
      ? n.toLocaleString('en-IN')
      : n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—';

const fmtINR = (n) => `₹${fmt(n)}`;

/* ─── Icons ───────────────────────────────────────────────────────── */
const RefreshIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0114.36-3.36L23 10M1 14l5.13 4.36A9 9 0 0020.49 15"/>
  </svg>
);

/* ─── Styles ──────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

  .dash-root { font-family: 'IBM Plex Sans', sans-serif; background: #f8f9fb; min-height: 100vh; padding: 20px; }

  /* header */
  .dash-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
  .dash-title { font-family: 'IBM Plex Mono', monospace; font-size: 15px; font-weight: 700; color: #111827; letter-spacing: -.3px; }
  .dash-sub { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #6b7280; margin-top: 3px; }
  .refresh-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px; border: 1.5px solid #d1d5db; background: #fff; font-size: 11px; font-family: 'IBM Plex Mono', monospace; cursor: pointer; color: #374151; transition: all .15s; }
  .refresh-btn:hover { border-color: #1558b0; color: #1558b0; background: #eff6ff; }
  .refresh-btn.spinning svg { animation: spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* period tabs */
  .period-tabs { display: flex; gap: 4px; margin-bottom: 16px; background: #fff; border: 1.5px solid #e4e7ec; border-radius: 8px; padding: 4px; width: fit-content; }
  .period-tab { padding: 5px 16px; border-radius: 5px; font-size: 12px; font-family: 'IBM Plex Mono', monospace; font-weight: 500; cursor: pointer; color: #6b7280; border: none; background: transparent; transition: all .15s; }
  .period-tab.active { background: #1558b0; color: #fff; }
  .period-tab:hover:not(.active) { background: #f1f5f9; color: #374151; }

  /* section label */
  .section-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 10px; }

  /* stat grid */
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px; }
  
  /* stat card */
  .stat-card { background: #fff; border: 1.5px solid #e4e7ec; border-radius: 10px; padding: 16px 18px; position: relative; overflow: hidden; transition: box-shadow .15s; }
  .stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.07); }
  .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 10px 10px 0 0; }
  .stat-card.pending::before  { background: #f97316; }
  .stat-card.success::before  { background: #22c55e; }
  .stat-card.failed::before   { background: #ef4444; }
  .stat-card.dispute::before  { background: #3b82f6; }
  .stat-card.volume::before   { background: #1558b0; }
  .stat-card.fulfilled::before { background: #8b5cf6; }
  .stat-card.orders::before   { background: #6b7280; }

  .stat-card-label { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: .6px; color: #6b7280; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
  .stat-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .dot-pending  { background: #f97316; }
  .dot-success  { background: #22c55e; }
  .dot-failed   { background: #ef4444; }
  .dot-dispute  { background: #3b82f6; }
  .dot-volume   { background: #1558b0; }
  .dot-fulfilled{ background: #8b5cf6; }
  .dot-orders   { background: #6b7280; }

  .stat-value { font-family: 'IBM Plex Mono', monospace; font-size: 22px; font-weight: 700; color: #111827; line-height: 1; margin-bottom: 4px; }
  .stat-value.small { font-size: 17px; }
  .stat-sub { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #9ca3af; }

  /* fulfillment bar */
  .fulfil-bar-wrap { margin-top: 8px; }
  .fulfil-bar-track { height: 4px; background: #e4e7ec; border-radius: 9px; overflow: hidden; }
  .fulfil-bar-fill  { height: 100%; border-radius: 9px; background: #8b5cf6; transition: width .4s ease; }
  .fulfil-bar-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #6b7280; margin-top: 4px; display: flex; justify-content: space-between; }

  /* breakdown row */
  .breakdown-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 12px; }
  .breakdown-card { background: #fff; border: 1.5px solid #e4e7ec; border-radius: 10px; padding: 18px 20px; }
  .breakdown-card-title { font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: #374151; margin-bottom: 14px; }

  .breakdown-table { width: 100%; border-collapse: collapse; }
  .breakdown-table th { font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; font-weight: 600; text-align: left; padding-bottom: 8px; border-bottom: 1.5px solid #f0f0f0; }
  .breakdown-table td { font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; padding: 8px 0; border-bottom: 1px solid #f8f8f8; color: #111827; }
  .breakdown-table tr:last-child td { border-bottom: none; }
  .breakdown-table .num { text-align: right; }
  .breakdown-table .label-cell { display: flex; align-items: center; gap: 7px; }

  /* skeleton */
  .skel { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: 4px; }
  @keyframes shimmer { to { background-position: -200% 0; } }
  .skel-val { height: 28px; width: 80px; }
  .skel-sub { height: 12px; width: 110px; margin-top: 6px; }
`;

/* ─── Sub-components ──────────────────────────────────────────────── */
const Skeleton = () => (
  <>
    <div className="skel skel-val" />
    <div className="skel skel-sub" />
  </>
);

const DOT_COLORS = {
  pending: 'dot-pending', success: 'dot-success', failed: 'dot-failed',
  dispute: 'dot-dispute', volume: 'dot-volume', fulfilled: 'dot-fulfilled', orders: 'dot-orders',
};

const StatCard = ({ label, value, sub, type = 'orders', loading, children }) => (
  <div className={`stat-card ${type}`}>
    <div className="stat-card-label">
      <span className={`stat-dot ${DOT_COLORS[type] || 'dot-orders'}`} />
      {label}
    </div>
    {loading ? (
      <Skeleton />
    ) : (
      <>
        <div className={`stat-value ${String(value).length > 9 ? 'small' : ''}`}>{value}</div>
        {sub && <div className="stat-sub">{sub}</div>}
        {children}
      </>
    )}
  </div>
);

const FulfillCard = ({ bucket, loading }) => {
  const pct = bucket?.totalFiat > 0
    ? Math.min(100, (bucket.totalFulfilled / bucket.totalFiat) * 100)
    : 0;

  return (
    <div className="stat-card fulfilled">
      <div className="stat-card-label">
        <span className="stat-dot dot-fulfilled" />
        Fulfillment
      </div>
      {loading ? <Skeleton /> : (
        <>
          <div className="stat-value">{pct.toFixed(1)}%</div>
          <div className="fulfil-bar-wrap">
            <div className="fulfil-bar-track">
              <div className="fulfil-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="fulfil-bar-label">
              <span>{fmtINR(bucket?.totalFulfilled ?? 0)} paid</span>
              <span>{fmtINR(bucket?.totalFiat ?? 0)} ordered</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const BreakdownTable = ({ title, buckets, loading }) => {
  const rows = [
    { key: 'pending',  label: 'Pending',  dotClass: 'dot-pending' },
    { key: 'success',  label: 'Success',  dotClass: 'dot-success' },
    { key: 'failed',   label: 'Failed',   dotClass: 'dot-failed' },
    { key: 'dispute',  label: 'Dispute',  dotClass: 'dot-dispute' },
  ];

  return (
    <div className="breakdown-card">
      <div className="breakdown-card-title">{title}</div>
      <table className="breakdown-table">
        <thead>
          <tr>
            <th>Status</th>
            <th className="num">Orders</th>
            <th className="num">Volume (₹)</th>
            <th className="num">Fulfilled (₹)</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 4 }, (_, i) => (
                <tr key={i}>
                  <td><div className="skel" style={{ height: 14, width: '80%' }} /></td>
                  <td><div className="skel" style={{ height: 14, width: '60%', marginLeft: 'auto' }} /></td>
                  <td><div className="skel" style={{ height: 14, width: '80%', marginLeft: 'auto' }} /></td>
                  <td><div className="skel" style={{ height: 14, width: '80%', marginLeft: 'auto' }} /></td>
                </tr>
              ))
            : rows.map((r) => {
                const b = buckets ?? {};
                return (
                  <tr key={r.key}>
                    <td>
                      <span className="label-cell">
                        <span className={`stat-dot ${r.dotClass}`} />
                        {r.label}
                      </span>
                    </td>
                    <td className="num">{fmt(b[r.key] ?? 0)}</td>
                    <td className="num">{fmtINR(b.totalFiat ?? 0)}</td>
                    <td className="num">{fmtINR(b.totalFulfilled ?? 0)}</td>
                  </tr>
                );
              })
          }
        </tbody>
      </table>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════ */
/*  Main Component                                                     */
/* ═══════════════════════════════════════════════════════════════════ */
const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week',  label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'total', label: 'All Time' },
];

const Dashboard = () => {
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [period, setPeriod]     = useState('today');
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGet('/dashboard/stats');
      if (res?.success) {
        setStats(res.stats);
        setLastRefresh(new Date());
      }
    } catch (e) {
      console.error('Dashboard stats error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchStats, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const bucket = stats?.[period] ?? null;

  const formatRefreshTime = () => {
    if (!lastRefresh) return '';
    return `Updated ${lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })} IST`;
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="dash-root">

        {/* ── Header ── */}
        <div className="dash-header">
          <div>
            <div className="dash-title">Dashboard</div>
            <div className="dash-sub">
              {stats?.asOf
                ? `Live · ${formatRefreshTime()}`
                : 'Loading statistics…'}
            </div>
          </div>
          <button
            className={`refresh-btn ${loading ? 'spinning' : ''}`}
            onClick={fetchStats}
            disabled={loading}
          >
            <RefreshIcon />
            Refresh
          </button>
        </div>

        {/* ── Period tabs ── */}
        <div className="period-tabs">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              className={`period-tab ${period === p.key ? 'active' : ''}`}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* ── Top stat cards ── */}
        <div className="section-label">Overview · {PERIODS.find((p) => p.key === period)?.label}</div>
        <div className="stat-grid">
          <StatCard label="Total Orders" value={fmt(bucket?.totalOrders ?? 0)} type="orders" loading={loading} />
          <StatCard label="Volume (Fiat)" value={fmtINR(bucket?.totalFiat ?? 0)} sub="Total fiat ordered" type="volume" loading={loading} />
          <StatCard label="Pending" value={fmt(bucket?.pending ?? 0)} sub="Awaiting action" type="pending" loading={loading} />
          <StatCard label="Success" value={fmt(bucket?.success ?? 0)} sub="Approved orders" type="success" loading={loading} />
          <StatCard label="Failed / Rejected" value={fmt(bucket?.failed ?? 0)} sub="Rejected orders" type="failed" loading={loading} />
          <StatCard label="Dispute" value={fmt(bucket?.dispute ?? 0)} sub="Under review" type="dispute" loading={loading} />
          <FulfillCard bucket={bucket} loading={loading} />
        </div>

        {/* ── Breakdown tables ── */}
        <div className="section-label" style={{ marginTop: 8 }}>Detailed Breakdown</div>
        <div className="breakdown-row">
          {PERIODS.map((p) => (
            <BreakdownTable
              key={p.key}
              title={p.label}
              buckets={stats?.[p.key]}
              loading={loading && !stats}
            />
          ))}
        </div>

      </div>
    </>
  );
};

export default Dashboard;
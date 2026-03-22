// pages/admin/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { adminGet } from '../../services/adminApi';
import * as XLSX from 'xlsx';

/* ─── Helpers ─────────────────────────────────────────────────────── */
const fmt    = (n) => typeof n === 'number' ? n % 1 === 0 ? n.toLocaleString('en-IN') : n.toLocaleString('en-IN', { minimumFractionDigits:2, maximumFractionDigits:2 }) : '—';
const fmtINR = (n) => `₹${fmt(n)}`;
const raw    = (n) => typeof n === 'number' ? Math.round(n * 100) / 100 : 0;

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
function nowIST() { return new Date(Date.now() + IST_OFFSET_MS); }
function istStartOfDay(y, m, d) { return new Date(Date.UTC(y, m, d, 0, 0, 0) - IST_OFFSET_MS); }
function istEndOfDay(y, m, d)   { return new Date(Date.UTC(y, m, d, 23, 59, 59, 999) - IST_OFFSET_MS); }

function getPeriodRange(periodKey) {
  const n = nowIST();
  const y = n.getUTCFullYear(), mo = n.getUTCMonth(), d = n.getUTCDate();
  switch (periodKey) {
    case 'today':
      return { from: istStartOfDay(y,mo,d).toISOString(), to: istEndOfDay(y,mo,d).toISOString() };
    case 'week': {
      const day = n.getUTCDay();
      const monOff = day === 0 ? -6 : 1 - day;
      return { from: istStartOfDay(y,mo,d+monOff).toISOString(), to: istEndOfDay(y,mo,d+monOff+6).toISOString() };
    }
    case 'month':
      return { from: istStartOfDay(y,mo,1).toISOString(), to: istEndOfDay(y,mo+1,0).toISOString() };
    default:
      return { from: '', to: '' }; // all time
  }
}

const fundTypeColors = {
  gateway: { color: '#1558b0', bg: '#eff6ff' },
  clean:   { color: '#15803d', bg: '#f0fdf4' },
  bank:    { color: '#92400e', bg: '#fffbeb' },
};

const PERIOD_LABELS = { today:'Today', week:'This Week', month:'This Month', total:'All Time' };
const PERIODS_LIST  = ['today','week','month','total'];

/* ─── Excel helpers ───────────────────────────────────────────────── */
function ordersToRows(orders) {
  const header = [
    'No','Date (IST)','Order ID','User Email',
    'Fund','Fund Code','Fund Type','Rate (₹)',
    'USDT','Fiat (₹)','Fulfilled (₹)','Fulfillment %',
    'UTR','Payment Mode','Account Name','Account No / UPI','IFSC',
    'Status',
  ];
  const rows = orders.map((o, i) => {
    const date = o.createdAt
      ? new Date(o.createdAt).toLocaleString('en-IN', { timeZone:'Asia/Kolkata', day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true })
      : '';
    const pct = o.fiat > 0 ? ((o.fulfilledFiat / o.fiat) * 100).toFixed(1) + '%' : '0%';
    return [
      i + 1, date,
      o.orderId ? `#${o.orderId}` : '',
      o.userId?.email ?? '',
      o.fund?.type ?? '', o.fund?.code ?? '', o.fund?.fundType ?? '', raw(o.fund?.rate),
      raw(o.usdt), raw(o.fiat), raw(o.fulfilledFiat), pct,
      o.UTR ?? '',
      o.bankCard?.mode ?? '',
      o.bankCard?.accountName ?? '',
      o.bankCard?.mode === 'upi' ? (o.bankCard?.upi ?? '') : (o.bankCard?.accountNumber ?? ''),
      o.bankCard?.ifsc ?? '',
      o.status ?? '',
    ];
  });
  return [header, ...rows];
}

function applyColWidths(ws) {
  ws['!cols'] = [
    {wch:5},{wch:20},{wch:14},{wch:26},{wch:18},{wch:8},{wch:10},{wch:8},
    {wch:8},{wch:10},{wch:12},{wch:12},{wch:16},{wch:12},{wch:22},{wch:22},{wch:14},{wch:10},
  ];
}

/* ── Export a single fund's orders for a specific period ── */
async function exportFundPeriod(fund, periodKey) {
  const { from, to } = getPeriodRange(periodKey);
  const periodLabel  = PERIOD_LABELS[periodKey];

  const params = new URLSearchParams({ fundId: fund.fundId });
  if (from) params.set('from', from);
  if (to)   params.set('to',   to);

  const res = await adminGet(`/orders/export?${params.toString()}`);
  if (!res?.success) throw new Error('Failed to fetch orders');

  const wb = XLSX.utils.book_new();

  // Info header sheet
  const infoRows = [
    [`${fund.type} (${fund.code}) — ${periodLabel} Orders`],
    [],
    ['Fund',     fund.type],
    ['Code',     fund.code],
    ['Type',     fund.fundType],
    ['Period',   periodLabel],
    ['Total',    res.orders.length],
    ['Exported', new Date().toLocaleString('en-IN', { timeZone:'Asia/Kolkata' })],
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(infoRows);
  wsInfo['!cols'] = [{wch:12},{wch:30}];
  wsInfo['!merges'] = [{ s:{r:0,c:0}, e:{r:0,c:1} }];
  XLSX.utils.book_append_sheet(wb, wsInfo, 'Info');

  // Orders sheet
  const wsOrders = XLSX.utils.aoa_to_sheet(ordersToRows(res.orders));
  applyColWidths(wsOrders);
  XLSX.utils.book_append_sheet(wb, wsOrders, 'Orders');

  const safeName = `${fund.code}_${periodLabel.replace(/\s+/g,'-')}_orders_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, safeName);
}

/* ── Full dashboard export (existing) ── */
async function exportDashboardExcel(stats, onProgress) {
  const wb = XLSX.utils.book_new();

  // Overall Summary
  const overallRows = [['Period','Total Orders','Volume (₹)','Fulfilled (₹)','Pending','Success','Failed','Dispute','Fulfillment %']];
  PERIODS_LIST.forEach(p => {
    const b = stats[p] ?? {};
    const pct = b.totalFiat > 0 ? ((b.totalFulfilled/b.totalFiat)*100).toFixed(2) : '0.00';
    overallRows.push([PERIOD_LABELS[p],raw(b.totalOrders),raw(b.totalFiat),raw(b.totalFulfilled),raw(b.pending),raw(b.success),raw(b.failed),raw(b.dispute),`${pct}%`]);
  });
  const wsOverall = XLSX.utils.aoa_to_sheet(overallRows);
  wsOverall['!cols'] = [{wch:14},{wch:14},{wch:16},{wch:16},{wch:10},{wch:10},{wch:10},{wch:10},{wch:14}];
  XLSX.utils.book_append_sheet(wb, wsOverall, 'Overall Summary');

  // Fund Summary
  const byFundRows = [['Fund Code','Fund Name','Fund Type','Status','Period','Total Orders','Volume (₹)','Fulfilled (₹)','Pending','Success','Failed','Dispute','Fulfillment %']];
  (stats.byFund ?? []).forEach(fund => {
    PERIODS_LIST.forEach(p => {
      const b = fund.stats?.[p] ?? {};
      const pct = b.totalFiat > 0 ? ((b.totalFulfilled/b.totalFiat)*100).toFixed(2) : '0.00';
      byFundRows.push([fund.code,fund.type,fund.fundType,fund.status,PERIOD_LABELS[p],raw(b.totalOrders),raw(b.totalFiat),raw(b.totalFulfilled),raw(b.pending),raw(b.success),raw(b.failed),raw(b.dispute),`${pct}%`]);
    });
    byFundRows.push([]);
  });
  const wsByFund = XLSX.utils.aoa_to_sheet(byFundRows);
  wsByFund['!cols'] = [{wch:10},{wch:20},{wch:10},{wch:10},{wch:12},{wch:14},{wch:16},{wch:16},{wch:10},{wch:10},{wch:10},{wch:10},{wch:14}];
  XLSX.utils.book_append_sheet(wb, wsByFund, 'Fund Summary');

  // All orders
  onProgress?.('Fetching all orders…');
  const allRes = await adminGet('/orders/export');
  if (allRes?.success) {
    const ws = XLSX.utils.aoa_to_sheet(ordersToRows(allRes.orders));
    applyColWidths(ws);
    XLSX.utils.book_append_sheet(wb, ws, 'All Orders');
  }

  // Per-fund
  const funds = stats.byFund ?? [];
  for (let i = 0; i < funds.length; i++) {
    const fund = funds[i];
    onProgress?.(`Fetching ${fund.code} orders… (${i+1}/${funds.length})`);
    const res = await adminGet(`/orders/export?fundId=${fund.fundId}`);
    if (res?.success) {
      const ws = XLSX.utils.aoa_to_sheet(ordersToRows(res.orders));
      applyColWidths(ws);
      XLSX.utils.book_append_sheet(wb, ws, `${fund.code} Orders`.slice(0,31));
    }
  }

  // Per-period
  for (const p of ['today','week','month']) {
    const { from, to } = getPeriodRange(p);
    onProgress?.(`Fetching ${PERIOD_LABELS[p]} orders…`);
    const res = await adminGet(`/orders/export?from=${from}&to=${to}`);
    if (res?.success) {
      const ws = XLSX.utils.aoa_to_sheet(ordersToRows(res.orders));
      applyColWidths(ws);
      XLSX.utils.book_append_sheet(wb, ws, `${PERIOD_LABELS[p]} Orders`.slice(0,31));
    }
  }

  const now = new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}).replace(/[/:, ]+/g,'-').slice(0,19);
  XLSX.writeFile(wb, `dashboard_export_${now}.xlsx`);
}

/* ─── Icons ───────────────────────────────────────────────────────── */
const RefreshIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0114.36-3.36L23 10M1 14l5.13 4.36A9 9 0 0020.49 15"/>
  </svg>
);
const DownloadIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

/* ─── Styles ──────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

  .dash-root { font-family: 'IBM Plex Sans', sans-serif; background: #f8f9fb; min-height: 100vh; padding: 20px; }

  .dash-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; gap: 12px; flex-wrap: wrap; }
  .dash-title { font-family: 'IBM Plex Mono', monospace; font-size: 15px; font-weight: 700; color: #111827; letter-spacing: -.3px; }
  .dash-sub { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #6b7280; margin-top: 3px; }
  .dash-header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

  .refresh-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px; border: 1.5px solid #d1d5db; background: #fff; font-size: 11px; font-family: 'IBM Plex Mono', monospace; cursor: pointer; color: #374151; transition: all .15s; white-space: nowrap; }
  .refresh-btn:hover { border-color: #1558b0; color: #1558b0; background: #eff6ff; }
  .refresh-btn:disabled { opacity:.5; cursor:not-allowed; }
  .refresh-btn.spinning svg { animation: spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .export-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 6px; border: none; background: #1a7f4b; color: #fff; font-size: 11px; font-family: 'IBM Plex Mono', monospace; font-weight: 600; cursor: pointer; transition: background .15s; white-space: nowrap; }
  .export-btn:hover:not(:disabled) { background: #15693e; }
  .export-btn:disabled { opacity: .5; cursor: not-allowed; }

  /* per-fund export button */
  .fund-export-btn { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; border: 1.5px solid #e4e7ec; background: #fff; font-size: 10px; font-family: 'IBM Plex Mono', monospace; font-weight: 600; color: #374151; cursor: pointer; transition: all .15s; white-space: nowrap; }
  .fund-export-btn:hover:not(:disabled) { border-color: #1a7f4b; color: #1a7f4b; background: #f0fdf4; }
  .fund-export-btn:disabled { opacity: .45; cursor: not-allowed; }
  .fund-export-btn.loading { border-color: #d1d5db; color: #9ca3af; }
  .fund-export-btn .btn-spin { width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid rgba(0,0,0,.15); border-top-color: #374151; animation: spin .7s linear infinite; flex-shrink: 0; }

  /* export progress toast */
  .export-progress { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:#111827; color:#fff; padding:10px 18px; border-radius:8px; font-size:12px; font-family:'IBM Plex Mono',monospace; z-index:9999; display:flex; align-items:center; gap:10px; box-shadow:0 4px 20px rgba(0,0,0,.35); animation:epIn .2s ease; white-space:nowrap; }
  @keyframes epIn { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  .ep-spin { width:12px; height:12px; border-radius:50%; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; animation:spin .7s linear infinite; flex-shrink:0; }

  .period-tabs { display: flex; gap: 4px; margin-bottom: 16px; background: #fff; border: 1.5px solid #e4e7ec; border-radius: 8px; padding: 4px; width: fit-content; }
  .period-tab { padding: 5px 16px; border-radius: 5px; font-size: 12px; font-family: 'IBM Plex Mono', monospace; font-weight: 500; cursor: pointer; color: #6b7280; border: none; background: transparent; transition: all .15s; }
  .period-tab.active { background: #1558b0; color: #fff; }
  .period-tab:hover:not(.active) { background: #f1f5f9; color: #374151; }

  .section-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 10px; }

  .stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px; }
  .stat-card { background: #fff; border: 1.5px solid #e4e7ec; border-radius: 10px; padding: 16px 18px; position: relative; overflow: hidden; transition: box-shadow .15s; }
  .stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.07); }
  .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 10px 10px 0 0; }
  .stat-card.pending::before  { background: #f97316; }
  .stat-card.success::before  { background: #22c55e; }
  .stat-card.failed::before   { background: #ef4444; }
  .stat-card.dispute::before  { background: #3b82f6; }
  .stat-card.volume::before   { background: #1558b0; }
  .stat-card.fulfilled::before{ background: #8b5cf6; }
  .stat-card.orders::before   { background: #6b7280; }
  .stat-card-label { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: .6px; color: #6b7280; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
  .stat-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .dot-pending{background:#f97316;} .dot-success{background:#22c55e;} .dot-failed{background:#ef4444;} .dot-dispute{background:#3b82f6;} .dot-volume{background:#1558b0;} .dot-fulfilled{background:#8b5cf6;} .dot-orders{background:#6b7280;}
  .stat-value { font-family: 'IBM Plex Mono', monospace; font-size: 22px; font-weight: 700; color: #111827; line-height: 1; margin-bottom: 4px; }
  .stat-value.small { font-size: 17px; }
  .stat-sub { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #9ca3af; }
  .fulfil-bar-wrap { margin-top: 8px; }
  .fulfil-bar-track { height: 4px; background: #e4e7ec; border-radius: 9px; overflow: hidden; }
  .fulfil-bar-fill  { height: 100%; border-radius: 9px; background: #8b5cf6; transition: width .4s ease; }
  .fulfil-bar-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #6b7280; margin-top: 4px; display: flex; justify-content: space-between; }

  .breakdown-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 12px; }
  .breakdown-card { background: #fff; border: 1.5px solid #e4e7ec; border-radius: 10px; padding: 18px 20px; }
  .breakdown-card-title { font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: #374151; margin-bottom: 14px; }
  .breakdown-table { width: 100%; border-collapse: collapse; }
  .breakdown-table th { font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: .5px; color: #9ca3af; font-weight: 600; text-align: left; padding-bottom: 8px; border-bottom: 1.5px solid #f0f0f0; }
  .breakdown-table td { font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; padding: 8px 0; border-bottom: 1px solid #f8f8f8; color: #111827; }
  .breakdown-table tr:last-child td { border-bottom: none; }
  .breakdown-table .num { text-align: right; }
  .breakdown-table .label-cell { display: flex; align-items: center; gap: 7px; }

  .fund-breakdown-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px; }
  .fund-card { background: #fff; border: 1.5px solid #e4e7ec; border-radius: 10px; overflow: hidden; transition: box-shadow .15s; }
  .fund-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.07); }
  .fund-card-header { padding: 12px 16px 10px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 10px; }
  .fund-card-code { font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 700; border-radius: 5px; padding: 2px 8px; letter-spacing: 1px; }
  .fund-card-name { font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; font-weight: 600; color: #111827; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .fund-card-status { font-size: 10px; font-family: 'IBM Plex Mono', monospace; font-weight: 600; text-transform: uppercase; padding: 2px 7px; border-radius: 20px; }
  .fund-card-status.active   { background: #f0fdf4; color: #15803d; }
  .fund-card-status.inactive { background: #fef2f2; color: #b91c1c; }
  .fund-card-status.stockout { background: #fffbeb; color: #b45309; }
  .fund-card-body { padding: 12px 16px 14px; }
  .fund-mini-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
  .fund-mini-stat { background: #f9fafb; border-radius: 7px; padding: 8px 10px; }
  .fund-mini-label { font-family: 'IBM Plex Mono', monospace; font-size: 9.5px; text-transform: uppercase; letter-spacing: .6px; color: #9ca3af; margin-bottom: 3px; display: flex; align-items: center; gap: 4px; }
  .fund-mini-val { font-family: 'IBM Plex Mono', monospace; font-size: 15px; font-weight: 700; color: #111827; line-height: 1; }
  .fund-fulfil { margin-top: 8px; }
  .fund-fulfil-bar-track { height: 3px; background: #e4e7ec; border-radius: 9px; overflow: hidden; }
  .fund-fulfil-bar-fill  { height: 100%; border-radius: 9px; background: #8b5cf6; transition: width .4s ease; }
  .fund-fulfil-label { font-family: 'IBM Plex Mono', monospace; font-size: 9.5px; color: #9ca3af; margin-top: 3px; display: flex; justify-content: space-between; }
  .fund-status-pills { display: flex; gap: 5px; flex-wrap: wrap; }
  .fund-pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 20px; font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; font-weight: 600; }
  .fund-pill-pending{background:#fff7ed;color:#c2410c;} .fund-pill-success{background:#f0fdf4;color:#15803d;} .fund-pill-failed{background:#fef2f2;color:#b91c1c;} .fund-pill-dispute{background:#eff6ff;color:#1d4ed8;}
  .fund-pill-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .skel { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: 4px; }
  @keyframes shimmer { to { background-position: -200% 0; } }
  .skel-val { height: 28px; width: 80px; }
  .skel-sub { height: 12px; width: 110px; margin-top: 6px; }
`;

/* ─── Sub-components ──────────────────────────────────────────────── */
const Skeleton  = () => (<><div className="skel skel-val" /><div className="skel skel-sub" /></>);
const DOT_COLORS = { pending:'dot-pending',success:'dot-success',failed:'dot-failed',dispute:'dot-dispute',volume:'dot-volume',fulfilled:'dot-fulfilled',orders:'dot-orders' };

const StatCard = ({ label, value, sub, type='orders', loading, children }) => (
  <div className={`stat-card ${type}`}>
    <div className="stat-card-label"><span className={`stat-dot ${DOT_COLORS[type]||'dot-orders'}`}/>{label}</div>
    {loading ? <Skeleton /> : (<><div className={`stat-value ${String(value).length>9?'small':''}`}>{value}</div>{sub&&<div className="stat-sub">{sub}</div>}{children}</>)}
  </div>
);

const FulfillCard = ({ bucket, loading }) => {
  const pct = bucket?.totalFiat > 0 ? Math.min(100,(bucket.totalFulfilled/bucket.totalFiat)*100) : 0;
  return (
    <div className="stat-card fulfilled">
      <div className="stat-card-label"><span className="stat-dot dot-fulfilled"/>Fulfillment</div>
      {loading ? <Skeleton /> : (<>
        <div className="stat-value">{pct.toFixed(1)}%</div>
        <div className="fulfil-bar-wrap">
          <div className="fulfil-bar-track"><div className="fulfil-bar-fill" style={{width:`${pct}%`}}/></div>
          <div className="fulfil-bar-label"><span>{fmtINR(bucket?.totalFulfilled??0)} paid</span><span>{fmtINR(bucket?.totalFiat??0)} ordered</span></div>
        </div>
      </>)}
    </div>
  );
};

const BreakdownTable = ({ title, buckets, loading }) => {
  const rows = [{key:'pending',label:'Pending',dotClass:'dot-pending'},{key:'success',label:'Success',dotClass:'dot-success'},{key:'failed',label:'Failed',dotClass:'dot-failed'},{key:'dispute',label:'Dispute',dotClass:'dot-dispute'}];
  return (
    <div className="breakdown-card">
      <div className="breakdown-card-title">{title}</div>
      <table className="breakdown-table">
        <thead><tr><th>Status</th><th className="num">Orders</th><th className="num">Volume (₹)</th><th className="num">Fulfilled (₹)</th></tr></thead>
        <tbody>
          {loading ? Array.from({length:4},(_,i)=>(
            <tr key={i}><td><div className="skel" style={{height:14,width:'80%'}}/></td><td><div className="skel" style={{height:14,width:'60%',marginLeft:'auto'}}/></td><td><div className="skel" style={{height:14,width:'80%',marginLeft:'auto'}}/></td><td><div className="skel" style={{height:14,width:'80%',marginLeft:'auto'}}/></td></tr>
          )) : rows.map(r=>{const b=buckets??{};return(<tr key={r.key}><td><span className="label-cell"><span className={`stat-dot ${r.dotClass}`}/>{r.label}</span></td><td className="num">{fmt(b[r.key]??0)}</td><td className="num">{fmtINR(b.totalFiat??0)}</td><td className="num">{fmtINR(b.totalFulfilled??0)}</td></tr>);})}
        </tbody>
      </table>
    </div>
  );
};

/* ─── FundCard — with per-period export button ────────────────────── */
const FundCard = ({ fund, period }) => {
  const [exporting, setExporting] = useState(false);

  const bucket = fund.stats?.[period] ?? {};
  const ftCfg  = fundTypeColors[fund.fundType] || fundTypeColors.gateway;
  const pct    = bucket.totalFiat > 0 ? Math.min(100,(bucket.totalFulfilled/bucket.totalFiat)*100) : 0;

  const pills = [
    { key:'pending', label:'Pending', dot:'#f97316', cls:'fund-pill-pending' },
    { key:'success', label:'OK',      dot:'#22c55e', cls:'fund-pill-success' },
    { key:'failed',  label:'Failed',  dot:'#ef4444', cls:'fund-pill-failed'  },
    { key:'dispute', label:'Dispute', dot:'#3b82f6', cls:'fund-pill-dispute' },
  ].filter(p => (bucket[p.key] ?? 0) > 0);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await exportFundPeriod(fund, period);
    } catch (e) {
      console.error('Fund export error:', e);
    } finally {
      setExporting(false);
    }
  };

  const periodLabel = PERIOD_LABELS[period];

  return (
    <div className="fund-card">
      {/* Header */}
      <div className="fund-card-header">
        <span className="fund-card-code" style={{color:ftCfg.color,background:ftCfg.bg}}>{fund.code}</span>
        <span className="fund-card-name">{fund.type}</span>
        <span className={`fund-card-status ${fund.status}`}>{fund.status}</span>
      </div>

      {/* Body */}
      <div className="fund-card-body">
        <div className="fund-mini-stats">
          <div className="fund-mini-stat">
            <div className="fund-mini-label"><span className="stat-dot dot-orders"/>Orders</div>
            <div className="fund-mini-val">{fmt(bucket.totalOrders??0)}</div>
          </div>
          <div className="fund-mini-stat">
            <div className="fund-mini-label"><span className="stat-dot dot-pending"/>Pending</div>
            <div className="fund-mini-val">{fmt(bucket.pending??0)}</div>
          </div>
          <div className="fund-mini-stat">
            <div className="fund-mini-label"><span className="stat-dot dot-volume"/>Volume</div>
            <div className="fund-mini-val" style={{fontSize:13}}>{fmtINR(bucket.totalFiat??0)}</div>
          </div>
          <div className="fund-mini-stat">
            <div className="fund-mini-label"><span className="stat-dot dot-success"/>Success</div>
            <div className="fund-mini-val">{fmt(bucket.success??0)}</div>
          </div>
        </div>

        {/* Fulfillment bar */}
        <div className="fund-fulfil">
          <div className="fund-fulfil-bar-track">
            <div className="fund-fulfil-bar-fill" style={{width:`${pct}%`}}/>
          </div>
          <div className="fund-fulfil-label">
            <span>Fulfillment {pct.toFixed(1)}%</span>
            <span>{fmtINR(bucket.totalFulfilled??0)} / {fmtINR(bucket.totalFiat??0)}</span>
          </div>
        </div>

        {/* Status pills */}
        {pills.length > 0 && (
          <div className="fund-status-pills" style={{marginTop:10}}>
            {pills.map(p=>(
              <span key={p.key} className={`fund-pill ${p.cls}`}>
                <span className="fund-pill-dot" style={{background:p.dot}}/>{p.label}: {fmt(bucket[p.key])}
              </span>
            ))}
          </div>
        )}

        {/* Export button — uses the currently selected period */}
        <div style={{marginTop:12, paddingTop:10, borderTop:'1px solid #f0f0f0'}}>
          <button
            className={`fund-export-btn${exporting?' loading':''}`}
            onClick={handleExport}
            disabled={exporting || (bucket.totalOrders ?? 0) === 0}
            title={`Export ${fund.code} orders for ${periodLabel}`}
          >
            {exporting ? (
              <><div className="btn-spin"/>Exporting…</>
            ) : (
              <><DownloadIcon size={11}/>{periodLabel} Orders ({fmt(bucket.totalOrders??0)})</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════ */
const PERIODS = [{key:'today',label:'Today'},{key:'week',label:'This Week'},{key:'month',label:'This Month'},{key:'total',label:'All Time'}];

const Dashboard = () => {
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState('');
  const [period, setPeriod]       = useState('today');
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGet('/dashboard/stats');
      if (res?.success) { setStats(res.stats); setLastRefresh(new Date()); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 2 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchStats]);

  const handleFullExport = async () => {
    if (!stats || exporting) return;
    setExporting(true);
    setExportMsg('Starting export…');
    try {
      await exportDashboardExcel(stats, (msg) => setExportMsg(msg));
    } catch (e) {
      console.error('Export error:', e);
    } finally {
      setExporting(false);
      setExportMsg('');
    }
  };

  const bucket = stats?.[period] ?? null;
  const byFund = stats?.byFund ?? [];

  const formatRefreshTime = () => {
    if (!lastRefresh) return '';
    return `Updated ${lastRefresh.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true,timeZone:'Asia/Kolkata'})} IST`;
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="dash-root">

        {/* Header */}
        <div className="dash-header">
          <div>
            <div className="dash-title">Dashboard</div>
            <div className="dash-sub">{stats?.asOf ? `Live · ${formatRefreshTime()}` : 'Loading statistics…'}</div>
          </div>
          <div className="dash-header-actions">
            <button className="export-btn" onClick={handleFullExport} disabled={!stats||exporting}
              title="Downloads all stats + order lists across all funds and periods">
              <DownloadIcon/>
              {exporting ? 'Exporting…' : 'Export Full Report'}
            </button>
            <button className={`refresh-btn ${loading?'spinning':''}`} onClick={fetchStats} disabled={loading}>
              <RefreshIcon/>Refresh
            </button>
          </div>
        </div>

        {/* Period tabs */}
        <div className="period-tabs">
          {PERIODS.map(p=>(
            <button key={p.key} className={`period-tab ${period===p.key?'active':''}`} onClick={()=>setPeriod(p.key)}>{p.label}</button>
          ))}
        </div>

        {/* Overall cards */}
        <div className="section-label">Overview · {PERIODS.find(p=>p.key===period)?.label}</div>
        <div className="stat-grid">
          <StatCard label="Total Orders"      value={fmt(bucket?.totalOrders??0)}  type="orders"   loading={loading}/>
          <StatCard label="Volume (Fiat)"     value={fmtINR(bucket?.totalFiat??0)} sub="Total fiat ordered" type="volume" loading={loading}/>
          <StatCard label="Pending"           value={fmt(bucket?.pending??0)}       sub="Awaiting action"   type="pending" loading={loading}/>
          <StatCard label="Success"           value={fmt(bucket?.success??0)}       sub="Approved orders"   type="success" loading={loading}/>
          <StatCard label="Failed / Rejected" value={fmt(bucket?.failed??0)}        sub="Rejected orders"   type="failed"  loading={loading}/>
          <StatCard label="Dispute"           value={fmt(bucket?.dispute??0)}       sub="Under review"      type="dispute" loading={loading}/>
          <FulfillCard bucket={bucket} loading={loading}/>
        </div>

        {/* Per-fund cards */}
        <div className="section-label" style={{marginTop:8}}>
          By Fund · {PERIODS.find(p=>p.key===period)?.label}
          <span style={{fontWeight:400,marginLeft:8,color:'#b0b8c8'}}>— click export on each card to download that fund's orders</span>
        </div>
        <div className="fund-breakdown-grid" style={{marginBottom:20}}>
          {(loading&&!stats) ? Array.from({length:4},(_,i)=>(
            <div key={i} className="fund-card">
              <div className="fund-card-header"><div className="skel" style={{height:18,width:40,borderRadius:5}}/><div className="skel" style={{height:14,width:100,flex:1}}/></div>
              <div className="fund-card-body"><div className="skel skel-val"/><div className="skel skel-sub" style={{marginTop:8}}/></div>
            </div>
          )) : byFund.map(fund=>(
            <FundCard key={fund.fundId} fund={fund} period={period} />
          ))}
        </div>

        {/* Detailed breakdown */}
        <div className="section-label" style={{marginTop:8}}>Detailed Breakdown</div>
        <div className="breakdown-row">
          {PERIODS.map(p=>(<BreakdownTable key={p.key} title={p.label} buckets={stats?.[p.key]} loading={loading&&!stats}/>))}
        </div>

      </div>

      {/* Full export progress toast */}
      {exportMsg && (
        <div className="export-progress">
          <div className="ep-spin"/>{exportMsg}
        </div>
      )}
    </>
  );
};

export default Dashboard;
import { Button, DatePicker, Input, Table, Radio, Flex, Typography, Card, Tooltip } from 'antd';
import React, { lazy, useEffect, useState, useRef, useCallback } from 'react';
import { formatDate } from '../../services/formatDate';
import { adminGet, adminPatch } from '../../services/adminApi';
import { Tag } from 'antd';
import ConfirmModal from '../../components/common/ConfirmModal';
const Uploads = lazy(() => import('../../components/Uploads'));
import AddPayment from '../../components/OrderPaymentManager';
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;
const { Search } = Input;
const { Text } = Typography;

/* ─── Status tag ──────────────────────────────────────────────────── */
const getStatusTag = (status) => {
  const statusColors = {
    pending: 'orange', stockout: 'orange',
    dispute: 'blue',
    success: 'green', active: 'green',
    inactive: 'red', failed: 'red',
  };
  return <Tag className='text-xs' color={statusColors[status]}>{status.toUpperCase()}</Tag>;
};

const TableIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>
  </svg>
);
const DatabaseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ─── IST date range helper ───────────────────────────────────────── */
// Server is UTC. Admin operates UAE (UTC+4). Orders are India-based.
// We compute ranges in IST (UTC+5:30) so "Today" means India's today.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function nowIST() {
  return new Date(Date.now() + IST_OFFSET_MS);
}
function istStartOfDay(y, m, d) {
  return new Date(Date.UTC(y, m, d, 0, 0, 0) - IST_OFFSET_MS);
}
function istEndOfDay(y, m, d) {
  return new Date(Date.UTC(y, m, d, 23, 59, 59, 999) - IST_OFFSET_MS);
}
function quickRangeToUTC(preset) {
  const n = nowIST();
  const y = n.getUTCFullYear(), mo = n.getUTCMonth(), d = n.getUTCDate();
  switch (preset) {
    case 'today':     return { from: istStartOfDay(y,mo,d).toISOString(),   to: istEndOfDay(y,mo,d).toISOString() };
    case 'yesterday': return { from: istStartOfDay(y,mo,d-1).toISOString(), to: istEndOfDay(y,mo,d-1).toISOString() };
    case 'last3':     return { from: istStartOfDay(y,mo,d-2).toISOString(), to: istEndOfDay(y,mo,d).toISOString() };
    case 'lastweek':  return { from: istStartOfDay(y,mo,d-6).toISOString(), to: istEndOfDay(y,mo,d).toISOString() };
    case 'lastmonth': return { from: istStartOfDay(y,mo-1,d).toISOString(), to: istEndOfDay(y,mo,d).toISOString() };
    default:          return { from: '', to: '' };
  }
}

/* ─── Styles ──────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

  .orders-root { font-family:'IBM Plex Sans',sans-serif; background:#f8f9fb; min-height:100vh; }

  .orders-toolbar { background:#fff; border-bottom:1.5px solid #e4e7ec; padding:14px 20px 12px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
  .orders-title { font-size:15px; font-weight:700; letter-spacing:-.3px; color:#111827; font-family:'IBM Plex Mono',monospace; }
  .orders-subtitle { font-size:11px; color:#6b7280; font-family:'IBM Plex Mono',monospace; margin-top:1px; }

  .export-btn-group { display:flex; gap:8px; align-items:center; }
  .export-btn { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; border:none; transition:all .15s; font-family:'IBM Plex Sans',sans-serif; }
  .export-btn:disabled { opacity:.45; cursor:not-allowed; }
  .export-btn-sheet { background:#1a7f4b; color:#fff; }
  .export-btn-sheet:hover:not(:disabled) { background:#15693e; }
  .export-btn-full  { background:#1558b0; color:#fff; }
  .export-btn-full:hover:not(:disabled)  { background:#0f44a0; }
  .export-count-badge { background:rgba(255,255,255,.25); border-radius:10px; padding:1px 7px; font-size:10px; font-family:'IBM Plex Mono',monospace; }

  .sel-bar { background:#1558b0; color:#fff; padding:8px 20px; display:flex; align-items:center; gap:12px; font-size:12px; font-family:'IBM Plex Mono',monospace; border-bottom:2px solid #0f44a0; }
  .sel-bar-count { font-weight:700; }
  .sel-bar-clear { cursor:pointer; opacity:.75; font-size:11px; text-decoration:underline; }
  .sel-bar-clear:hover { opacity:1; }

  /* quick date strip */
  .quick-strip { background:#fff; padding:8px 20px; border-bottom:1px solid #e4e7ec; display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
  .qd-label { font-size:10.5px; color:#9ca3af; font-family:'IBM Plex Mono',monospace; margin-right:4px; flex-shrink:0; }
  .qd-btn { padding:3px 11px; border-radius:20px; border:1.5px solid #e4e7ec; font-size:11px; font-family:'IBM Plex Mono',monospace; cursor:pointer; background:#fff; color:#374151; transition:all .13s; font-weight:500; white-space:nowrap; }
  .qd-btn:hover  { border-color:#1558b0; color:#1558b0; }
  .qd-btn.active { background:#1558b0; color:#fff; border-color:#1558b0; }

  /* stats strip */
  .stat-strip { background:#f9fafb; border-bottom:1px solid #e4e7ec; padding:8px 20px; display:flex; gap:0; align-items:stretch; }
  .stat-item { display:flex; flex-direction:column; padding:0 24px 0 0; }
  .stat-item + .stat-item { padding-left:24px; border-left:1px solid #e4e7ec; }
  .stat-lbl { font-size:10px; text-transform:uppercase; letter-spacing:.7px; color:#9ca3af; font-family:'IBM Plex Mono',monospace; margin-bottom:2px; display:flex; align-items:center; gap:5px; }
  .stat-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
  .stat-val { font-family:'IBM Plex Mono',monospace; font-size:16px; font-weight:700; color:#111827; line-height:1; }
  .stat-sub { font-family:'IBM Plex Mono',monospace; font-size:10px; color:#6b7280; margin-top:2px; }

  .filters-row { background:#fff; padding:10px 20px; border-bottom:1px solid #e4e7ec; display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
  .orders-table-wrap { padding:16px 20px; }

  .order-row-selected td  { background:#dbeafe !important; }
  .order-row-selected:hover td { background:#bfdbfe !important; }
  .drag-overlay { position:fixed; border:2px dashed #1558b0; background:rgba(21,88,176,.07); pointer-events:none; z-index:9999; border-radius:3px; }

  .row-num-cell { font-family:'IBM Plex Mono',monospace; font-size:11px; color:#9ca3af; user-select:none; min-width:28px; text-align:center; }
  .row-check { width:16px; height:16px; border:1.5px solid #d1d5db; border-radius:3px; display:inline-flex; align-items:center; justify-content:center; background:#fff; cursor:pointer; flex-shrink:0; transition:all .1s; }
  .row-check.checked { background:#1558b0; border-color:#1558b0; }
  .row-check-cell { display:flex; align-items:center; gap:6px; }
  .amount-cell { font-family:'IBM Plex Mono',monospace; font-weight:600; color:#111827; font-size:12.5px; }

  .ant-table-thead > tr > th { background:#f1f3f7 !important; font-family:'IBM Plex Mono',monospace !important; font-size:11px !important; font-weight:600 !important; color:#374151 !important; text-transform:uppercase !important; letter-spacing:.5px !important; border-bottom:2px solid #d1d5db !important; padding:10px 12px !important; }
  .ant-table-tbody > tr > td { font-size:12.5px; padding:9px 12px !important; border-bottom:1px solid #f0f0f0 !important; }
  .ant-table-tbody > tr:hover > td { background:#f9fafb !important; }

  .select-all-check { width:16px; height:16px; border:1.5px solid #9ca3af; border-radius:3px; display:inline-flex; align-items:center; justify-content:center; background:#fff; cursor:pointer; }
  .select-all-check.all  { background:#1558b0; border-color:#1558b0; }
  .select-all-check.some { background:#93c5fd; border-color:#1558b0; }

  .export-toast { position:fixed; bottom:28px; right:28px; background:#111827; color:#fff; padding:12px 20px; border-radius:8px; font-size:13px; font-family:'IBM Plex Sans',sans-serif; z-index:9999; animation:toastIn .25s ease; box-shadow:0 4px 20px rgba(0,0,0,.35); display:flex; align-items:center; gap:10px; }
  .export-toast .toast-icon { width:20px; height:20px; background:#22c55e; border-radius:50%; display:flex; align-items:center; justify-content:center; }
  @keyframes toastIn { from { transform:translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }
  .drag-hint { font-size:10.5px; color:#9ca3af; font-family:'IBM Plex Mono',monospace; display:flex; align-items:center; gap:4px; }
`;

/* ─── Excel helpers ───────────────────────────────────────────────── */
function exportSheetView(orders, filename = 'orders_sheet_view.xlsx') {
  const rows = orders.map((o) => ({
    AMOUNT: o.fiat ?? '',
    'ACCOUNT NAME': o.bankCard?.accountName ?? o.bankCard?.upi ?? '',
    'ACCOUNT NUMBER': o.bankCard?.accountNumber ?? o.bankCard?.upi ?? '',
    BANK: o.bankCard?.bank ?? '',
    IFSC: o.bankCard?.ifsc ?? '',
  }));
  const total = orders.reduce((s, o) => s + (Number(o.fiat) || 0), 0);
  rows.push({ AMOUNT: total, 'ACCOUNT NAME': 'TOTAL', 'ACCOUNT NUMBER': '', BANK: '', IFSC: '' });
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 12 }, { wch: 24 }, { wch: 20 }, { wch: 8 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  XLSX.writeFile(wb, filename);
}
function exportFullData(orders, filename = 'orders_full_export.xlsx') {
  const rows = orders.map((o, i) => ({
    No: i + 1,
    Date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) : '',
    'Order ID': o.orderId ? `#${o.orderId}` : '',
    'User Email': o.userId?.email ?? '',
    USDT: o.usdt ?? '',
    'Fiat (₹)': o.fiat ?? '',
    'Fund Type': o.fund?.type ?? '',
    'Fund Rate': o.fund?.rate ?? '',
    'Fund Status': o.fund?.status ?? '',
    'Bank Mode': o.bankCard?.mode ?? '',
    'Account Number': o.bankCard?.accountNumber ?? '',
    IFSC: o.bankCard?.ifsc ?? '',
    'Account Name': o.bankCard?.accountName ?? '',
    UPI: o.bankCard?.upi ?? '',
    UTR: o.UTR ?? '',
    'Fulfilled Fiat (₹)': o.fulfilledFiat ?? '',
    Status: o.status ?? '',
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    {wch:5},{wch:14},{wch:14},{wch:26},{wch:10},{wch:10},{wch:12},{wch:10},
    {wch:12},{wch:10},{wch:18},{wch:14},{wch:22},{wch:18},{wch:16},{wch:14},{wch:10},
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Full Orders');
  XLSX.writeFile(wb, filename);
}

/* ─── Toast ───────────────────────────────────────────────────────── */
const Toast = ({ msg, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  return (
    <div className="export-toast">
      <div className="toast-icon"><CheckIcon /></div>{msg}
    </div>
  );
};

/* ─── Stat strip ──────────────────────────────────────────────────── */
const StatStrip = ({ stats, loading }) => (
  <div className="stat-strip">
    {[
      { key: 'pending', label: 'Pending', dot: '#f97316' },
      { key: 'success', label: 'Success', dot: '#22c55e' },
      { key: 'failed',  label: 'Failed',  dot: '#ef4444' },
    ].map(({ key, label, dot }) => (
      <div key={key} className="stat-item">
        <div className="stat-lbl"><span className="stat-dot" style={{ background: dot }} />{label}</div>
        <div className="stat-val">{loading ? '—' : (stats?.[key]?.count ?? 0)}</div>
        <div className="stat-sub">₹{loading ? '—' : (stats?.[key]?.amount ?? 0).toLocaleString('en-IN')}</div>
      </div>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════ */
const QUICK_PRESETS = [
  { label: 'Today',      value: 'today' },
  { label: 'Yesterday',  value: 'yesterday' },
  { label: 'Last 3 Days',value: 'last3' },
  { label: 'Last Week',  value: 'lastweek' },
  { label: 'Last Month', value: 'lastmonth' },
  { label: 'All',        value: 'all' },
];

const Orders = () => {
  const [queryObjects, setQueryObjects] = useState({
    search: '', from: '', to: '', status: 'pending', currentPage: 1, pageSize: 10,
  });
  const [totalOrders, setTotalOrders]                   = useState(0);
  const [totalCompletedAmount, setTotalCompletedAmount] = useState(0);
  const [loading, setLoading]         = useState({ table: false });
  const [actionLoading, setActionLoading] = useState(false); // FIX #1
  const [modalState, setModalState]   = useState({ visible: false, type: '', data: null });
  const [orders, setOrders]           = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [toast, setToast]             = useState(null);
  const [quickPreset, setQuickPreset] = useState('all');
  const [stats, setStats]             = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const isDragging   = useRef(false);
  const dragOverlay  = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const tableRef     = useRef(null);

  /* ── FIX #1: close modal first, then refresh ── */
  const handleConfirm = async (fulfilledFiat, utr) => {
    const { type, data } = modalState;
    const status = type === 'approve' ? 'success' : 'failed';
    setActionLoading(true);
    try {
      await adminPatch('/orders', {
        status,
        id: data._id,
        ...(status === 'success' && { fulfilledFiat }),
        ...(utr && { UTR: utr }),              // FIX #2: send UTR to backend
      });
      setModalState({ visible: false, type: '', data: null }); // close first
      await fetchOrders();
      await fetchStats();
    } catch (err) {
      console.error('handleConfirm:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading((p) => ({ ...p, table: true }));
    try {
      const { search, from, to, status, currentPage, pageSize } = queryObjects;
      const res = await adminGet(
        `/orders?search=${encodeURIComponent(search)}&from=${from}&to=${to}&status=${status}&currentPage=${currentPage}&pageSize=${pageSize}`
      );
      if (res) {
        setOrders(res.orders);
        setTotalOrders(res.total || res.orders.length);
        setTotalCompletedAmount(res.totalCompletedAmount || 0);
      }
    } catch (e) { console.error(e); }
    finally { setLoading((p) => ({ ...p, table: false })); }
  };

  /* FIX #3: separate lightweight stats endpoint */
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const { from, to } = queryObjects;
      const res = await adminGet(`/orders/stats?from=${from}&to=${to}`);
      if (res?.success) setStats(res.stats);
    } catch (e) { console.error(e); }
    finally { setStatsLoading(false); }
  };

  useEffect(() => { fetchOrders(); fetchStats(); }, [queryObjects]);

  const handleQuickPreset = (preset) => {
    setQuickPreset(preset);
    setQueryObjects((p) => ({ ...p, ...quickRangeToUTC(preset), currentPage: 1 }));
  };

  /* ── Selection ── */
  const allKeys     = orders.map((o) => o._id);
  const allSelected = allKeys.length > 0 && allKeys.every((k) => selectedRowKeys.includes(k));
  const someSelected = selectedRowKeys.length > 0 && !allSelected;
  const toggleAll   = () => setSelectedRowKeys(allSelected ? [] : allKeys);
  const toggleRow   = (key) =>
    setSelectedRowKeys((p) => p.includes(key) ? p.filter((k) => k !== key) : [...p, key]);

  /* ── Drag-to-select ── */
  const handleRowMouseDown = useCallback((e, key) => {
    if (e.button !== 0) return;
    isDragging.current   = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    const el = document.createElement('div');
    el.className = 'drag-overlay';
    el.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:0;height:0`;
    document.body.appendChild(el);
    dragOverlay.current = el;

    const onMove = (me) => {
      if (!isDragging.current) return;
      const x = Math.min(me.clientX, dragStartPos.current.x);
      const y = Math.min(me.clientY, dragStartPos.current.y);
      if (dragOverlay.current)
        dragOverlay.current.style.cssText = `left:${x}px;top:${y}px;width:${Math.abs(me.clientX-dragStartPos.current.x)}px;height:${Math.abs(me.clientY-dragStartPos.current.y)}px`;
      if (tableRef.current) {
        const keysInBox = [];
        tableRef.current.querySelectorAll('tr.ant-table-row').forEach((row) => {
          const mid = row.getBoundingClientRect().top + row.getBoundingClientRect().height / 2;
          if (mid >= Math.min(me.clientY, dragStartPos.current.y) && mid <= Math.max(me.clientY, dragStartPos.current.y)) {
            const rk = row.getAttribute('data-row-key');
            if (rk) keysInBox.push(rk);
          }
        });
        if (keysInBox.length > 0) setSelectedRowKeys(keysInBox);
      }
    };
    const onUp = () => {
      isDragging.current = false;
      dragOverlay.current?.remove();
      dragOverlay.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [orders]);

  /* ── Export ── */
  const getExportOrders = () =>
    selectedRowKeys.length > 0 ? orders.filter((o) => selectedRowKeys.includes(o._id)) : orders;
  const handleExportSheet = () => { const d = getExportOrders(); exportSheetView(d, `orders_sheet_${Date.now()}.xlsx`); setToast(`Sheet exported — ${d.length} rows`); };
  const handleExportFull  = () => { const d = getExportOrders(); exportFullData(d, `orders_full_${Date.now()}.xlsx`);   setToast(`Full export — ${d.length} rows`); };

  /* ── Filters ── */
  const handleStatusChange = (e) =>
    setQueryObjects((p) => ({ ...p, status: e.target.value.toLowerCase(), currentPage: 1 }));
  const handleDateRange = (dates) => {
    setQuickPreset('');
    if (!dates) {
      setQueryObjects((p) => ({ ...p, from: '', to: '' }));
    } else {
      const [s, e] = dates;
      setQueryObjects((p) => ({
        ...p,
        from: istStartOfDay(s.year(), s.month(), s.date()).toISOString(),
        to:   istEndOfDay(e.year(), e.month(), e.date()).toISOString(),
        currentPage: 1,
      }));
    }
  };
  // FIX #4: search covers orderId + accountNumber + accountName (backend handles it)
  const handleSearch = (value) =>
    setQueryObjects((p) => ({ ...p, search: value, currentPage: 1 }));

  /* ── Columns ── */
  const getColumns = () => [
    {
      title: (
        <span className={`select-all-check ${allSelected ? 'all' : someSelected ? 'some' : ''}`} onClick={toggleAll}>
          {(allSelected || someSelected) && <CheckIcon />}
        </span>
      ),
      key: 'select', width: 44,
      render: (_t, record) => (
        <div className="row-check-cell" onMouseDown={(e) => { e.stopPropagation(); handleRowMouseDown(e, record._id); }}>
          <span className={`row-check ${selectedRowKeys.includes(record._id) ? 'checked' : ''}`}
            onClick={(e) => { e.stopPropagation(); toggleRow(record._id); }}>
            {selectedRowKeys.includes(record._id) && <CheckIcon />}
          </span>
        </div>
      ),
    },
    { title: '#', key: 'index', width: 44,
      render: (_t, _r, i) => <span className="row-num-cell">{(queryObjects.currentPage-1)*queryObjects.pageSize+i+1}</span> },
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', width: 120,
      render: (t) => <span style={{ fontFamily:'IBM Plex Mono', fontSize:11.5 }}>{formatDate(t)}</span> },
    { title: 'Order ID', dataIndex: 'orderId', key: 'orderId',
      render: (t) => <span style={{ fontFamily:'IBM Plex Mono', fontSize:12, color:'#1558b0', fontWeight:600 }}>{`#${t}`}</span> },
    { title: 'User', dataIndex: 'userId', key: 'userId',
      render: (t) => <span style={{ fontSize:12 }}>{t?.email}</span> },
    { title: 'USDT', dataIndex: 'usdt', key: 'usdt',
      render: (t) => <span className="amount-cell">{t} <span style={{ color:'#6b7280', fontWeight:400 }}>USDT</span></span> },
    { title: 'Fiat', dataIndex: 'fiat', key: 'fiat',
      render: (t) => <span className="amount-cell">₹{t}</span> },
    { title: 'Fund', dataIndex: 'fund', key: 'fund',
      render: (t) => (
        <Card bodyStyle={{ padding: '4px 8px' }} size="small" style={{ minWidth: 90 }}>
          <div style={{ fontSize:11.5 }}><div>Type: {t?.type}</div><div>Rate: ₹{t?.rate}</div></div>
          {t?.status && <div style={{ marginTop:2 }}>{getStatusTag(t.status)}</div>}
        </Card>
      ),
    },
    { title: 'Bank / UPI', dataIndex: 'bankCard', key: 'bankCard', width: 200,
      render: (t) => (
        <Card bodyStyle={{ padding: '4px 8px' }} size="small">
          <div style={{ fontSize:11.5, fontWeight:500 }}>
            {t.mode === 'bank' && <><div>Acc: {t?.accountNumber}</div><div>IFSC: {t?.ifsc}</div><div>Name: {t?.accountName}</div></>}
            {t.mode === 'upi'  && <div>UPI: {t?.upi}</div>}
          </div>
        </Card>
      ),
    },
    { title: 'UTR', dataIndex: 'UTR', key: 'UTR',   // FIX #2: display UTR
      render: (t) => t
        ? <span style={{ fontFamily:'IBM Plex Mono', fontSize:12, color:'#1558b0' }}>{t}</span>
        : <span style={{ color:'#d1d5db', fontSize:11 }}>—</span>,
    },
    { title: 'Fulfilled', dataIndex: 'fulfilledFiat', key: 'fulfilledFiat',
      render: (t, r) => (
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <span className="amount-cell">₹{t}<span style={{ color:'#9ca3af', fontWeight:400 }}>/{r.fiat}</span></span>
          <AddPayment onSuccess={fetchOrders} order={r} />
        </div>
      ),
    },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => getStatusTag(s) },
    { title: 'Receipts', key: 'receipts', render: (_t, r) => <Uploads order={r} /> },
    { title: 'Actions', key: '_id',
      render: (_t, r) => r.status === 'pending' ? (
        <div style={{ display:'flex', gap:6 }}>
          <Button size="small" type="primary" style={{ background:'#16a34a', borderColor:'#16a34a' }}
            onClick={() => setModalState({ visible:true, type:'approve', data:r })}>Approve</Button>
          <Button size="small" danger
            onClick={() => setModalState({ visible:true, type:'reject',  data:r })}>Reject</Button>
        </div>
      ) : null,
    },
  ];

  const exportCount = selectedRowKeys.length > 0 ? selectedRowKeys.length : orders.length;

  return (
    <>
      <style>{STYLES}</style>
      <div className="orders-root">

        {/* Toolbar */}
        <div className="orders-toolbar">
          <div>
            <div className="orders-title">Orders History</div>
            <div className="orders-subtitle">{totalOrders} total · ₹{totalCompletedAmount?.toLocaleString('en-IN')} completed</div>
          </div>
          <div className="export-btn-group">
            <Tooltip title="Amount, Account Name, Account Number, Bank, IFSC">
              <button className="export-btn export-btn-sheet" onClick={handleExportSheet} disabled={orders.length===0}>
                <TableIcon />Sheet View<span className="export-count-badge">{exportCount}</span>
              </button>
            </Tooltip>
            <Tooltip title="All fields — full raw data">
              <button className="export-btn export-btn-full" onClick={handleExportFull} disabled={orders.length===0}>
                <DatabaseIcon />Full Export<span className="export-count-badge">{exportCount}</span>
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Quick date preset strip */}
        <div className="quick-strip">
          <span className="qd-label">Range (IST):</span>
          {QUICK_PRESETS.map((p) => (
            <button key={p.value} className={`qd-btn${quickPreset===p.value?' active':''}`}
              onClick={() => handleQuickPreset(p.value)}>{p.label}</button>
          ))}
          <span className="qd-label" style={{ marginLeft:10 }}>Custom:</span>
          <RangePicker size="small" style={{ width:240 }} onChange={handleDateRange} />
        </div>

        {/* Stats strip */}
        <StatStrip stats={stats} loading={statsLoading} />

        {/* Selection bar */}
        {selectedRowKeys.length > 0 && (
          <div className="sel-bar">
            <span className="sel-bar-count">{selectedRowKeys.length} row{selectedRowKeys.length!==1?'s':''} selected</span>
            <span>· Export uses selected rows only</span>
            <span className="sel-bar-clear" onClick={() => setSelectedRowKeys([])}>Clear</span>
            <span style={{ marginLeft:'auto', opacity:.6, fontSize:10 }}>Tip: drag to multi-select</span>
          </div>
        )}

        {/* Filters */}
        <div className="filters-row">
          <Radio.Group onChange={handleStatusChange} defaultValue="pending">
            <Radio.Button value="">All</Radio.Button>
            <Radio.Button value="pending">Pending</Radio.Button>
            <Radio.Button value="success">Success</Radio.Button>
            <Radio.Button value="failed">Failed</Radio.Button>
          </Radio.Group>
          {/* FIX #4: unified search */}
          <Search
            placeholder="Order ID / Account No / Account Name"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          {selectedRowKeys.length===0 && (
            <span className="drag-hint" style={{ marginLeft:'auto' }}>⬚ Drag or click checkboxes to select for export</span>
          )}
        </div>

        {/* Table */}
        <div className="orders-table-wrap" ref={tableRef}>
          <Table
            scroll={{ x:'max-content' }}
            loading={loading.table}
            columns={getColumns()}
            dataSource={orders}
            rowKey="_id"
            size="middle"
            rowClassName={(r) => selectedRowKeys.includes(r._id) ? 'order-row-selected' : ''}
            onRow={(record) => ({
              onMouseDown: (e) => {
                if (e.target.closest('button') || e.target.closest('input')) return;
                handleRowMouseDown(e, record._id);
              },
            })}
            pagination={{
              current: queryObjects.currentPage,
              pageSize: queryObjects.pageSize,
              total: totalOrders,
              showSizeChanger: true,
              pageSizeOptions: ['10','20','50'],
              showTotal: (total) => `Total ${total} items`,
              onChange: (page, pageSize) => setQueryObjects((p) => ({ ...p, currentPage:page, pageSize })),
            }}
          />
        </div>
      </div>

      {/* FIX #1 + #2: actionLoading separate from table loading, showUTR prop */}
      <ConfirmModal
        visible={modalState.visible}
        onConfirm={handleConfirm}
        onCancel={() => setModalState({ visible:false, type:'', data:null })}
        loading={actionLoading}
        title={`Confirm ${modalState.type==='approve'?'Approve':'Reject'}`}
        content={`Are you sure you want to ${modalState.type==='approve'?'approve':'reject'} this order? This action cannot be undone.`}
        type={modalState.type}
        order={modalState.data}
        showUTR={modalState.type === 'approve'}
      />

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </>
  );
};

export default Orders;
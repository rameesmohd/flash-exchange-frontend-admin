import { Button, DatePicker, Input, Table, Radio, Flex, Typography, Card, Tooltip, Badge } from 'antd';
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

/* ─── Tiny icon helpers ───────────────────────────────────────────── */
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
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

/* ─── Styles injected once ────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

  .orders-root { font-family: 'IBM Plex Sans', sans-serif; background: #f8f9fb; min-height: 100vh; }

  /* toolbar */
  .orders-toolbar { background:#fff; border-bottom:1.5px solid #e4e7ec; padding:14px 20px 12px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
  .orders-title { font-size:15px; font-weight:700; letter-spacing:-.3px; color:#111827; font-family:'IBM Plex Mono',monospace; }
  .orders-subtitle { font-size:11px; color:#6b7280; font-family:'IBM Plex Mono',monospace; margin-top:1px; }

  /* export buttons */
  .export-btn-group { display:flex; gap:8px; align-items:center; }
  .export-btn { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; border:none; transition:all .15s; font-family:'IBM Plex Sans',sans-serif; letter-spacing:.2px; }
  .export-btn:disabled { opacity:.45; cursor:not-allowed; }
  .export-btn-sheet { background:#1a7f4b; color:#fff; }
  .export-btn-sheet:hover:not(:disabled) { background:#15693e; }
  .export-btn-full { background:#1558b0; color:#fff; }
  .export-btn-full:hover:not(:disabled) { background:#1249940; }
  .export-btn-full:hover:not(:disabled) { background:#0f44a0; }
  .export-count-badge { background:rgba(255,255,255,.25); border-radius:10px; padding:1px 7px; font-size:10px; font-family:'IBM Plex Mono',monospace; }

  /* selection bar */
  .sel-bar { background:#1558b0; color:#fff; padding:8px 20px; display:flex; align-items:center; gap:12px; font-size:12px; font-family:'IBM Plex Mono',monospace; border-bottom:2px solid #0f44a0; }
  .sel-bar-count { font-weight:700; }
  .sel-bar-clear { cursor:pointer; opacity:.75; font-size:11px; text-decoration:underline; }
  .sel-bar-clear:hover { opacity:1; }

  /* filters row */
  .filters-row { background:#fff; padding:10px 20px; border-bottom:1px solid #e4e7ec; display:flex; gap:8px; flex-wrap:wrap; align-items:center; }

  /* stat strip */
  .stat-strip { background:#fff; border-bottom:1px solid #e4e7ec; padding:8px 20px; display:flex; gap:24px; align-items:center; }
  .stat-item { display:flex; align-items:center; gap:6px; font-size:11.5px; color:#374151; font-family:'IBM Plex Mono',monospace; }
  .stat-dot { width:7px; height:7px; border-radius:50%; }

  /* table wrapper */
  .orders-table-wrap { padding:16px 20px; }

  /* row selection highlight */
  .order-row-selected td { background:#dbeafe !important; }
  .order-row-selected:hover td { background:#bfdbfe !important; }

  /* drag selection overlay */
  .drag-overlay { position:fixed; border:2px dashed #1558b0; background:rgba(21,88,176,.07); pointer-events:none; z-index:9999; border-radius:3px; }

  /* row number cell */
  .row-num-cell { font-family:'IBM Plex Mono',monospace; font-size:11px; color:#9ca3af; user-select:none; min-width:28px; text-align:center; }
  
  /* checkbox cell */
  .row-check { width:16px; height:16px; border:1.5px solid #d1d5db; border-radius:3px; display:inline-flex; align-items:center; justify-content:center; background:#fff; cursor:pointer; flex-shrink:0; transition:all .1s; }
  .row-check.checked { background:#1558b0; border-color:#1558b0; }
  .row-check-cell { display:flex; align-items:center; gap:6px; }

  /* amount cell */
  .amount-cell { font-family:'IBM Plex Mono',monospace; font-weight:600; color:#111827; font-size:12.5px; }

  /* column header */
  .ant-table-thead > tr > th { background:#f1f3f7 !important; font-family:'IBM Plex Mono',monospace !important; font-size:11px !important; font-weight:600 !important; color:#374151 !important; text-transform:uppercase !important; letter-spacing:.5px !important; border-bottom:2px solid #d1d5db !important; padding:10px 12px !important; }
  .ant-table-tbody > tr > td { font-size:12.5px; padding:9px 12px !important; border-bottom:1px solid #f0f0f0 !important; }
  .ant-table-tbody > tr:hover > td { background:#f9fafb !important; }

  /* select all header */
  .select-all-check { width:16px; height:16px; border:1.5px solid #9ca3af; border-radius:3px; display:inline-flex; align-items:center; justify-content:center; background:#fff; cursor:pointer; }
  .select-all-check.all { background:#1558b0; border-color:#1558b0; }
  .select-all-check.some { background:#93c5fd; border-color:#1558b0; }

  /* toast */
  .export-toast { position:fixed; bottom:28px; right:28px; background:#111827; color:#fff; padding:12px 20px; border-radius:8px; font-size:13px; font-family:'IBM Plex Sans',sans-serif; z-index:9999; animation:toastIn .25s ease; box-shadow:0 4px 20px rgba(0,0,0,.35); display:flex; align-items:center; gap:10px; }
  .export-toast .toast-icon { width:20px; height:20px; background:#22c55e; border-radius:50%; display:flex; align-items:center; justify-content:center; }
  @keyframes toastIn { from { transform:translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }

  /* help tip */
  .drag-hint { font-size:10.5px; color:#9ca3af; font-family:'IBM Plex Mono',monospace; display:flex; align-items:center; gap:4px; }
`;

/* ─── Excel export helpers ────────────────────────────────────────── */

/**
 * Export "sheet view" — like the screenshot: Amount, Account Name, Account Number, Bank, IFSC
 */
function exportSheetView(orders, filename = 'orders_sheet_view.xlsx') {
  const rows = orders.map((o) => ({
    AMOUNT: o.fiat ?? '',
    'ACCOUNT NAME': o.bankCard?.accountName ?? o.bankCard?.upi ?? '',
    'ACCOUNT NUMBER': o.bankCard?.accountNumber ?? o.bankCard?.upi ?? '',
    BANK: o.bankCard?.bank ?? '',
    IFSC: o.bankCard?.ifsc ?? '',
  }));

  // Total row
  const total = orders.reduce((s, o) => s + (Number(o.fiat) || 0), 0);
  rows.push({ AMOUNT: total, 'ACCOUNT NAME': '', 'ACCOUNT NUMBER': '', BANK: '', IFSC: '' });

  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws['!cols'] = [{ wch: 12 }, { wch: 24 }, { wch: 20 }, { wch: 8 }, { wch: 14 }];

  // Style header row bold (xlsx community edition doesn't support cell styles, but we can add a special row)
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  XLSX.writeFile(wb, filename);
}

/**
 * Export full raw data — all fields
 */
function exportFullData(orders, filename = 'orders_full_export.xlsx') {
  const rows = orders.map((o, i) => ({
    No: i + 1,
    Date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '',
    'Order ID': o.orderId ? `#${o.orderId}` : '',
    'User Email': o.userId?.email ?? '',
    'USDT': o.usdt ?? '',
    'Fiat (₹)': o.fiat ?? '',
    'Fund Type': o.fund?.type ?? '',
    'Fund Rate': o.fund?.rate ?? '',
    'Fund Channel': o.fund?.teleChannel ?? '',
    'Fund Status': o.fund?.status ?? '',
    'Bank Mode': o.bankCard?.mode ?? '',
    'Account Number': o.bankCard?.accountNumber ?? '',
    'IFSC': o.bankCard?.ifsc ?? '',
    'Account Name': o.bankCard?.accountName ?? '',
    'UPI': o.bankCard?.upi ?? '',
    'Fulfilled Fiat (₹)': o.fulfilledFiat ?? '',
    'Status': o.status ?? '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 5 }, { wch: 12 }, { wch: 14 }, { wch: 26 }, { wch: 10 }, { wch: 10 },
    { wch: 12 }, { wch: 10 }, { wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 18 },
    { wch: 14 }, { wch: 22 }, { wch: 18 }, { wch: 14 }, { wch: 10 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Full Orders');
  XLSX.writeFile(wb, filename);
}

/* ─── Toast component ─────────────────────────────────────────────── */
const Toast = ({ msg, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  return (
    <div className="export-toast">
      <div className="toast-icon"><CheckIcon /></div>
      {msg}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════ */
/*  Main Component                                                     */
/* ═══════════════════════════════════════════════════════════════════ */
const Orders = () => {
  const [queryObjects, setQueryObjects] = useState({
    search: '', from: '', to: '', status: 'pending', currentPage: 1, pageSize: 10,
  });
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCompletedAmount, setTotalCompletedAmount] = useState(0);
  const [loading, setLoading] = useState({ table: false, success: false, failed: false });
  const [modalState, setModalState] = useState({ visible: false, type: '', data: null });
  const [orders, setOrders] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [toast, setToast] = useState(null);

  // Drag-select state
  const isDragging = useRef(false);
  const dragStartKey = useRef(null);
  const dragOverlay = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const tableRef = useRef(null);

  /* ── Confirm modal handler ── */
  const handleConfirm = async () => {
    const { type, data } = modalState;
    const status = type === 'approve' ? 'success' : 'failed';
    try {
      setLoading((prev) => ({ ...prev, [status]: true }));
      const response = await adminPatch('/orders', { status, id: data._id });
      if (response?.success) fetchOrders();
    } catch (e) { console.log(e); }
    finally {
      setLoading((prev) => ({ ...prev, [status]: false }));
      setModalState({ visible: false, type: '', data: null });
    }
  };

  /* ── Fetch orders ── */
  const fetchOrders = async () => {
    setLoading((prev) => ({ ...prev, table: true }));
    try {
      const { search, from, to, status, currentPage, pageSize } = queryObjects;
      const response = await adminGet(
        `/orders?search=${search}&from=${from}&to=${to}&status=${status}&currentPage=${currentPage}&pageSize=${pageSize}`
      );
      if (response) {
        setOrders(response.orders);
        setTotalOrders(response.total || response.orders.length);
        setTotalCompletedAmount(response.totalCompletedAmount);
      }
    } catch (e) { console.error(e); }
    finally { setLoading((prev) => ({ ...prev, table: false })); }
  };

  useEffect(() => { fetchOrders(); }, [queryObjects]);

  /* ── Selection helpers ── */
  const allKeys = orders.map((o) => o._id);
  const allSelected = allKeys.length > 0 && allKeys.every((k) => selectedRowKeys.includes(k));
  const someSelected = selectedRowKeys.length > 0 && !allSelected;

  const toggleAll = () => {
    setSelectedRowKeys(allSelected ? [] : allKeys);
  };
  const toggleRow = (key) => {
    setSelectedRowKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  /* ── Drag-to-select ── */
  const handleRowMouseDown = useCallback((e, key) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    dragStartKey.current = key;
    dragStartPos.current = { x: e.clientX, y: e.clientY };

    // Create overlay
    const el = document.createElement('div');
    el.className = 'drag-overlay';
    el.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:0;height:0`;
    document.body.appendChild(el);
    dragOverlay.current = el;

    const onMove = (me) => {
      if (!isDragging.current) return;
      const x = Math.min(me.clientX, dragStartPos.current.x);
      const y = Math.min(me.clientY, dragStartPos.current.y);
      const w = Math.abs(me.clientX - dragStartPos.current.x);
      const h = Math.abs(me.clientY - dragStartPos.current.y);
      if (dragOverlay.current) {
        dragOverlay.current.style.left = x + 'px';
        dragOverlay.current.style.top = y + 'px';
        dragOverlay.current.style.width = w + 'px';
        dragOverlay.current.style.height = h + 'px';
      }
      // Find rows inside bounding box
      if (tableRef.current) {
        const rows = tableRef.current.querySelectorAll('tr.ant-table-row');
        const keysInBox = [];
        rows.forEach((row) => {
          const rect = row.getBoundingClientRect();
          const rowMid = rect.top + rect.height / 2;
          if (rowMid >= Math.min(me.clientY, dragStartPos.current.y) &&
              rowMid <= Math.max(me.clientY, dragStartPos.current.y)) {
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

  /* ── Export handlers ── */
  const getExportOrders = () =>
    selectedRowKeys.length > 0
      ? orders.filter((o) => selectedRowKeys.includes(o._id))
      : orders;

  const handleExportSheet = () => {
    const data = getExportOrders();
    exportSheetView(data, `orders_sheet_${Date.now()}.xlsx`);
    setToast(`Sheet view exported — ${data.length} row${data.length !== 1 ? 's' : ''}`);
  };

  const handleExportFull = () => {
    const data = getExportOrders();
    exportFullData(data, `orders_full_${Date.now()}.xlsx`);
    setToast(`Full data exported — ${data.length} row${data.length !== 1 ? 's' : ''}`);
  };

  /* ── Filters ── */
  const handleStatusChange = (e) =>
    setQueryObjects((prev) => ({ ...prev, status: e.target.value.toLowerCase(), currentPage: 1 }));

  const handleDateRange = (dates) => {
    if (!dates) {
      setQueryObjects((prev) => ({ ...prev, from: '', to: '' }));
    } else {
      const [s, e] = dates;
      setQueryObjects((prev) => ({
        ...prev,
        from: new Date(Date.UTC(s.year(), s.month(), s.date(), 0, 0, 0)).toISOString(),
        to: new Date(Date.UTC(e.year(), e.month(), e.date(), 23, 59, 59, 999)).toISOString(),
        currentPage: 1,
      }));
    }
  };

  const handleSearch = (value) =>
    setQueryObjects((prev) => ({ ...prev, search: value, currentPage: 1 }));

  /* ── Columns ── */
  const getColumns = () => [
    {
      title: (
        <div className="row-check-cell">
          <span
            className={`select-all-check ${allSelected ? 'all' : someSelected ? 'some' : ''}`}
            onClick={toggleAll}
          >
            {(allSelected || someSelected) && <CheckIcon />}
          </span>
        </div>
      ),
      key: 'select',
      width: 44,
      render: (_t, record) => (
        <div className="row-check-cell" onMouseDown={(e) => { e.stopPropagation(); handleRowMouseDown(e, record._id); }}>
          <span
            className={`row-check ${selectedRowKeys.includes(record._id) ? 'checked' : ''}`}
            onClick={(e) => { e.stopPropagation(); toggleRow(record._id); }}
          >
            {selectedRowKeys.includes(record._id) && <CheckIcon />}
          </span>
        </div>
      ),
    },
    {
      title: '#',
      key: 'index',
      width: 44,
      render: (_t, _r, i) => <span className="row-num-cell">{(queryObjects.currentPage - 1) * queryObjects.pageSize + i + 1}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (t) => <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11.5 }}>{formatDate(t)}</span>,
      width: 120,
    },
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (t) => <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: '#1558b0', fontWeight: 600 }}>{`#${t}`}</span>,
    },
    {
      title: 'User',
      dataIndex: 'userId',
      key: 'userId',
      render: (t) => <span style={{ fontSize: 12 }}>{t?.email}</span>,
    },
    {
      title: 'USDT',
      dataIndex: 'usdt',
      key: 'usdt',
      render: (t) => <span className="amount-cell">{t} <span style={{ color: '#6b7280', fontWeight: 400 }}>USDT</span></span>,
    },
    {
      title: 'Fiat',
      dataIndex: 'fiat',
      key: 'fiat',
      render: (t) => <span className="amount-cell">₹{t}</span>,
    },
    {
      title: 'Fund',
      dataIndex: 'fund',
      key: 'fund',
      render: (t) => (
        <Card bodyStyle={{ padding: 4, paddingLeft: 12 }} className="capitalize text-xs w-52">
          <Flex justify="space-between" className="w-full">
            <div className="font-semibold">
              <div>Type: {t?.type}</div>
              <div>Rate: ₹{t?.rate}</div>
              <div>Channel: {t?.teleChannel}</div>
            </div>
            <div>{t.status && getStatusTag(t.status)}</div>
          </Flex>
        </Card>
      ),
    },
    {
      title: 'Bank / UPI',
      dataIndex: 'bankCard',
      key: 'bankCard',
      width: 200,
      render: (t) => (
        <Card bodyStyle={{ padding: 4, paddingLeft: 12 }} className="capitalize text-xs font-semibold">
          {t.mode === 'bank' && (<><div>Acc: {t?.accountNumber}</div><div>IFSC: {t?.ifsc}</div><div>Name: {t?.accountName}</div></>)}
          {t.mode === 'upi' && <div>UPI: {t?.upi}</div>}
        </Card>
      ),
    },
    {
      title: 'Fulfilled',
      dataIndex: 'fulfilledFiat',
      key: 'fulfilledFiat',
      render: (t, r) => (
        <div className="flex w-full justify-between items-center">
          <span className="amount-cell">₹{t}<span style={{ color: '#9ca3af', fontWeight: 400 }}>/{r.fiat}</span></span>
          <AddPayment onSuccess={fetchOrders} order={r} />
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => getStatusTag(s),
    },
    {
      title: 'Receipts',
      key: 'receipts',
      render: (_t, r) => <div className="flex"><Uploads order={r} /></div>,
    },
    {
      title: '',
      key: '_id',
      render: (_t, r) => (
        <div className="flex gap-1">
          {r.status === 'pending' && (
            <>
              <Button size="small" loading={loading.success}
                onClick={() => setModalState({ visible: true, type: 'approve', data: r })}
                className="bg-green-500 text-white">Approve</Button>
              <Button size="small" loading={loading.failed}
                onClick={() => setModalState({ visible: true, type: 'reject', data: r })}
                className="bg-red-500 text-white">Reject</Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const exportCount = selectedRowKeys.length > 0 ? selectedRowKeys.length : orders.length;

  return (
    <>
      <style>{STYLES}</style>
      <div className="orders-root">

        {/* ── Toolbar ── */}
        <div className="orders-toolbar">
          <div>
            <div className="orders-title">Orders History</div>
            <div className="orders-subtitle">
              {totalOrders} total · ₹{totalCompletedAmount} completed
            </div>
          </div>
          <div className="export-btn-group">
            <Tooltip title="Export Amount, Account Name, Account Number, Bank, IFSC — like the sheet screenshot">
              <button className="export-btn export-btn-sheet" onClick={handleExportSheet} disabled={orders.length === 0}>
                <TableIcon />
                Sheet View
                <span className="export-count-badge">{exportCount}</span>
              </button>
            </Tooltip>
            <Tooltip title="Export all order fields — full raw data">
              <button className="export-btn export-btn-full" onClick={handleExportFull} disabled={orders.length === 0}>
                <DatabaseIcon />
                Full Export
                <span className="export-count-badge">{exportCount}</span>
              </button>
            </Tooltip>
          </div>
        </div>

        {/* ── Selection bar ── */}
        {selectedRowKeys.length > 0 && (
          <div className="sel-bar">
            <span className="sel-bar-count">{selectedRowKeys.length} row{selectedRowKeys.length !== 1 ? 's' : ''} selected</span>
            <span>·</span>
            <span>Export will use selected rows only</span>
            <span className="sel-bar-clear" onClick={() => setSelectedRowKeys([])}>Clear selection</span>
            <span style={{ marginLeft: 'auto', opacity: .6, fontSize: 10 }}>
              Tip: drag across rows to multi-select
            </span>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="filters-row">
          <Radio.Group onChange={handleStatusChange} defaultValue="pending"
            style={{ display: 'flex', flexShrink: 0 }}>
            <Radio.Button value="">All</Radio.Button>
            <Radio.Button value="pending">Pending</Radio.Button>
            <Radio.Button value="success">Success</Radio.Button>
            <Radio.Button value="failed">Failed</Radio.Button>
          </Radio.Group>
          <RangePicker className="h-8" style={{ width: 260 }} onChange={handleDateRange} />
          <Search placeholder="Order ID" allowClear onSearch={handleSearch} style={{ width: 220 }} />
          {selectedRowKeys.length === 0 && (
            <span className="drag-hint" style={{ marginLeft: 'auto' }}>
              ⬚ Drag rows or click checkboxes to select for export
            </span>
          )}
        </div>

        {/* ── Table ── */}
        <div className="orders-table-wrap" ref={tableRef}>
          <Table
            scroll={{ x: 'max-content' }}
            loading={loading.table}
            columns={getColumns()}
            dataSource={orders}
            rowKey="_id"
            rowClassName={(r) => selectedRowKeys.includes(r._id) ? 'order-row-selected' : ''}
            onRow={(record) => ({
              onMouseDown: (e) => {
                // Only start drag on the row body (not buttons/inputs)
                if (e.target.closest('button') || e.target.closest('input')) return;
                handleRowMouseDown(e, record._id);
              },
            })}
            pagination={{
              current: queryObjects.currentPage,
              pageSize: queryObjects.pageSize,
              total: totalOrders,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Total ${total} items`,
              onChange: (page, pageSize) =>
                setQueryObjects((prev) => ({ ...prev, currentPage: page, pageSize })),
            }}
          />
        </div>
      </div>

      {/* ── Confirm Modal ── */}
      <ConfirmModal
        visible={modalState.visible}
        onConfirm={handleConfirm}
        onCancel={() => setModalState({ visible: false, type: '', data: null })}
        loading={loading[modalState.type === 'approve' ? 'success' : 'failed']}
        title={`Confirm ${modalState.type === 'approve' ? 'Approve' : 'Reject'}`}
        content={`Are you sure you want to ${modalState.type === 'approve' ? 'approve' : 'reject'} this order? This action cannot be undone.`}
      />

      {/* ── Toast ── */}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </>
  );
};

export default Orders;
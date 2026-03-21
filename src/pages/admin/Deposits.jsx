import { Button, DatePicker, Radio, Table, Tag, Input, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { formatDate } from '../../services/formatDate';
import { adminGet } from '../../services/adminApi';
import { useNavigate } from 'react-router-dom';

const { RangePicker } = DatePicker;
const { Search } = Input;
const { Text } = Typography;

/* ─── Status tag ──────────────────────────────────────────────────── */
const getStatusTag = (status) => {
  const statusColors = {
    pending: 'orange', success: 'green', approved: 'green', failed: 'red', rejected: 'red',
  };
  return (
    <Tag color={statusColors[status] || 'default'} style={{ borderRadius: 4, fontWeight: 500, fontSize: 12 }}>
      {status.toUpperCase()}
    </Tag>
  );
};

/* ─── Icons ───────────────────────────────────────────────────────── */
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ─── IST helpers ─────────────────────────────────────────────────── */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
function nowIST() { return new Date(Date.now() + IST_OFFSET_MS); }
function istStartOfDay(y, m, d) { return new Date(Date.UTC(y, m, d,  0,  0,  0,   0) - IST_OFFSET_MS); }
function istEndOfDay(y, m, d)   { return new Date(Date.UTC(y, m, d, 23, 59, 59, 999) - IST_OFFSET_MS); }
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

/* ─── Toast ───────────────────────────────────────────────────────── */
const Toast = ({ msg, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  return (
    <div className="dep-toast">
      <div className="dep-toast-icon"><CheckIcon /></div>{msg}
    </div>
  );
};

/* ─── Stat strip ──────────────────────────────────────────────────── */
const StatStrip = ({ stats, loading }) => (
  <div className="dep-stat-strip">
    {[
      { key: 'pending', label: 'Pending', dot: '#f97316' },
      { key: 'success', label: 'Success', dot: '#22c55e' },
      { key: 'failed',  label: 'Failed',  dot: '#ef4444' },
    ].map(({ key, label, dot }) => (
      <div key={key} className="dep-stat-item">
        <div className="dep-stat-lbl"><span className="dep-stat-dot" style={{ background: dot }} />{label}</div>
        <div className="dep-stat-val">{loading ? '—' : (stats?.[key]?.count ?? 0)}</div>
        <div className="dep-stat-sub">
          ${loading ? '—' : (stats?.[key]?.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    ))}
    <div className="dep-stat-item" style={{ marginLeft: 'auto', paddingLeft: 24, borderLeft: '1px solid #e4e7ec' }}>
      <div className="dep-stat-lbl"><span className="dep-stat-dot" style={{ background: '#3b82f6' }} />Total Deposited</div>
      <div className="dep-stat-val" style={{ color: '#16a34a' }}>
        ${loading ? '—' : (stats?.totalDeposited ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className="dep-stat-sub">all time success</div>
    </div>
  </div>
);

/* ─── Styles ──────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

  .dep-root { font-family:'IBM Plex Sans',sans-serif; background:#f8f9fb; min-height:100vh; }

  .dep-toolbar { background:#fff; border-bottom:1.5px solid #e4e7ec; padding:14px 20px 12px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
  .dep-title    { font-size:15px; font-weight:700; letter-spacing:-.3px; color:#111827; font-family:'IBM Plex Mono',monospace; }
  .dep-subtitle { font-size:11px; color:#6b7280; font-family:'IBM Plex Mono',monospace; margin-top:1px; }

  .dep-quick-strip { background:#fff; padding:8px 20px; border-bottom:1px solid #e4e7ec; display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
  .dep-qd-label { font-size:10.5px; color:#9ca3af; font-family:'IBM Plex Mono',monospace; margin-right:4px; flex-shrink:0; }
  .dep-qd-btn { padding:3px 11px; border-radius:20px; border:1.5px solid #e4e7ec; font-size:11px; font-family:'IBM Plex Mono',monospace; cursor:pointer; background:#fff; color:#374151; transition:all .13s; font-weight:500; white-space:nowrap; }
  .dep-qd-btn:hover  { border-color:#1558b0; color:#1558b0; }
  .dep-qd-btn.active { background:#1558b0; color:#fff; border-color:#1558b0; }

  .dep-stat-strip { background:#f9fafb; border-bottom:1px solid #e4e7ec; padding:8px 20px; display:flex; gap:0; align-items:stretch; }
  .dep-stat-item { display:flex; flex-direction:column; padding:0 24px 0 0; }
  .dep-stat-item + .dep-stat-item { padding-left:24px; border-left:1px solid #e4e7ec; }
  .dep-stat-lbl { font-size:10px; text-transform:uppercase; letter-spacing:.7px; color:#9ca3af; font-family:'IBM Plex Mono',monospace; margin-bottom:2px; display:flex; align-items:center; gap:5px; }
  .dep-stat-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
  .dep-stat-val { font-family:'IBM Plex Mono',monospace; font-size:16px; font-weight:700; color:#111827; line-height:1; }
  .dep-stat-sub { font-family:'IBM Plex Mono',monospace; font-size:10px; color:#6b7280; margin-top:2px; }

  .dep-filters-row { background:#fff; padding:10px 20px; border-bottom:1px solid #e4e7ec; display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
  .dep-table-wrap  { padding:16px 20px; }

  .ant-table-thead > tr > th { background:#f1f3f7 !important; font-family:'IBM Plex Mono',monospace !important; font-size:11px !important; font-weight:600 !important; color:#374151 !important; text-transform:uppercase !important; letter-spacing:.5px !important; border-bottom:2px solid #d1d5db !important; padding:10px 12px !important; }
  .ant-table-tbody > tr > td { font-size:12.5px; padding:9px 12px !important; border-bottom:1px solid #f0f0f0 !important; }
  .ant-table-tbody > tr:hover > td { background:#f9fafb !important; }

  .dep-toast { position:fixed; bottom:28px; right:28px; background:#111827; color:#fff; padding:12px 20px; border-radius:8px; font-size:13px; font-family:'IBM Plex Sans',sans-serif; z-index:9999; animation:depToastIn .25s ease; box-shadow:0 4px 20px rgba(0,0,0,.35); display:flex; align-items:center; gap:10px; }
  .dep-toast-icon { width:20px; height:20px; background:#22c55e; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  @keyframes depToastIn { from { transform:translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }
`;

const QUICK_PRESETS = [
  { label: 'Today',       value: 'today' },
  { label: 'Yesterday',   value: 'yesterday' },
  { label: 'Last 3 Days', value: 'last3' },
  { label: 'Last Week',   value: 'lastweek' },
  { label: 'Last Month',  value: 'lastmonth' },
  { label: 'All',         value: 'all' },
];

/* ═══════════════════════════════════════════════════════════════════ */
const Deposits = () => {
  const [deposits, setDeposits]           = useState([]);
  const [loading, setLoading]             = useState(false);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [stats, setStats]                 = useState(null);
  const [statsLoading, setStatsLoading]   = useState(false);
  const [quickPreset, setQuickPreset]     = useState('all');
  const [toast, setToast]                 = useState(null);
  const navigate = useNavigate();

  const [queryObjects, setQueryObjects] = useState({
    search: '', from: '', to: '', status: 'success', currentPage: 1, pageSize: 10,
  });

  /* ── Columns ── */
  const getColumns = [
    {
      title: '#', key: 'index', width: 52,
      render: (_t, _r, i) => (
        <span style={{ fontFamily:'IBM Plex Mono', fontSize:11, color:'#9ca3af' }}>
          {(queryObjects.currentPage - 1) * queryObjects.pageSize + i + 1}
        </span>
      ),
    },
    {
      title: 'Transaction ID', dataIndex: 'transactionId', key: 'transactionId', width: 160,
      render: (text) => <Text code style={{ fontSize: 12 }}>#{text}</Text>,
    },
    {
      title: 'User', dataIndex: 'userId', key: 'userId', width: 200,
      render: (text) => <span style={{ fontSize: 12 }}>{text?.email}</span>,
    },
    {
      title: 'Date', dataIndex: 'createdAt', key: 'createdAt', width: 140,
      render: (text) => (
        <span style={{ fontFamily:'IBM Plex Mono', fontSize:11.5, color:'#6b7280' }}>{formatDate(text)}</span>
      ),
    },
    {
      title: 'Payment Mode', dataIndex: 'paymentMode', key: 'paymentMode', width: 140,
      render: (text) => <span style={{ fontSize: 12 }}>{text}</span>,
    },
    {
      title: 'Amount', dataIndex: 'amount', key: 'amount', width: 110,
      render: (text) => (
        <span style={{ fontFamily:'IBM Plex Mono', fontWeight:700, color:'#16a34a', fontSize:13 }}>
          +${text}
        </span>
      ),
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 110,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Payment Address', dataIndex: 'recieveAddress', key: 'recieveAddress',
      render: (text) => (
        <div style={{ lineHeight: 1.9, fontSize: 12 }}>
          <div>
            <Text type="secondary" style={{ fontSize:11 }}>Priority: </Text>
            <span style={{ fontSize:12 }}>{text?.priority}</span>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize:11 }}>Address: </Text>
            <Text code style={{ fontSize:11 }}>{text?.address}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'TxID', dataIndex: 'txid', key: 'txid',
      render: (text) => <Text code style={{ fontSize: 11 }}>{text}</Text>,
    },
  ];

  /* ── Fetch ── */
  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const { search, from, to, status, currentPage, pageSize } = queryObjects;
      const response = await adminGet(
        `/deposits?search=${encodeURIComponent(search)}&from=${from}&to=${to}&status=${status}&currentPage=${currentPage}&pageSize=${pageSize}`
      );
      if (response) {
        setDeposits(response.result);
        setTotalDeposits(response.total || response.result.length);
      }
    } catch (error) {
      console.error('Failed to fetch deposits:', error);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const { from, to } = queryObjects;
      const response = await adminGet(`/deposits/stats?from=${from}&to=${to}`);
      if (response?.success) setStats(response.stats);
    } catch (error) {
      console.error('Failed to fetch deposit stats:', error);
    }
    setStatsLoading(false);
  };

  useEffect(() => {
    fetchDeposits();
    fetchStats();
  }, [queryObjects]);

  /* ── Handlers ── */
  const handleQuickPreset = (preset) => {
    setQuickPreset(preset);
    setQueryObjects((prev) => ({ ...prev, ...quickRangeToUTC(preset), currentPage: 1 }));
  };

  const handleSearch = (value) =>
    setQueryObjects((prev) => ({ ...prev, search: value, currentPage: 1 }));

  const handleDateRange = (dates) => {
    setQuickPreset('');
    if (!dates) {
      setQueryObjects((prev) => ({ ...prev, from: '', to: '' }));
    } else {
      const [start, end] = dates;
      setQueryObjects((prev) => ({
        ...prev,
        from: istStartOfDay(start.year(), start.month(), start.date()).toISOString(),
        to:   istEndOfDay(end.year(), end.month(), end.date()).toISOString(),
        currentPage: 1,
      }));
    }
  };

  const handleStatusChange = (e) =>
    setQueryObjects((prev) => ({ ...prev, status: e.target.value.toLowerCase(), currentPage: 1 }));

  return (
    <>
      <style>{STYLES}</style>
      <div className="dep-root">

        {/* Toolbar */}
        <div className="dep-toolbar">
          <div>
            <div className="dep-title">Deposit History</div>
            <div className="dep-subtitle">{totalDeposits} total deposits</div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: '#3b82f6', borderColor: '#3b82f6' }}
            onClick={() => navigate('/add-funds')}
          >
            Add Funds to User
          </Button>
        </div>

        {/* Quick date preset strip */}
        <div className="dep-quick-strip">
          <span className="dep-qd-label">Range (IST):</span>
          {QUICK_PRESETS.map((p) => (
            <button
              key={p.value}
              className={`dep-qd-btn${quickPreset === p.value ? ' active' : ''}`}
              onClick={() => handleQuickPreset(p.value)}
            >
              {p.label}
            </button>
          ))}
          <span className="dep-qd-label" style={{ marginLeft: 10 }}>Custom:</span>
          <RangePicker size="small" style={{ width: 240 }} onChange={handleDateRange} />
        </div>

        {/* Stats strip */}
        <StatStrip stats={stats} loading={statsLoading} />

        {/* Filters */}
        <div className="dep-filters-row">
          <Radio.Group onChange={handleStatusChange} defaultValue="success">
            <Radio.Button value="">All</Radio.Button>
            <Radio.Button value="pending">Pending</Radio.Button>
            <Radio.Button value="success">Success</Radio.Button>
            <Radio.Button value="failed">Failed</Radio.Button>
          </Radio.Group>
          <Search
            placeholder="Transaction ID / User email"
            allowClear
            onSearch={handleSearch}
            style={{ width: 280 }}
          />
        </div>

        {/* Table */}
        <div className="dep-table-wrap">
          <Table
            columns={getColumns}
            dataSource={deposits}
            loading={loading}
            rowKey="_id"
            size="middle"
            scroll={{ x: 'max-content' }}
            pagination={{
              current: queryObjects.currentPage,
              pageSize: queryObjects.pageSize,
              total: totalDeposits,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Total ${total} records`,
              onChange: (page, pageSize) =>
                setQueryObjects((prev) => ({ ...prev, currentPage: page, pageSize })),
            }}
          />
        </div>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </>
  );
};

export default Deposits;
import { Button, DatePicker, Input, Table, Radio, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { formatDate } from '../../services/formatDate';
import ConfirmModal from '../../components/common/ConfirmModal';
import { adminGet, adminPatch } from '../../services/adminApi';
import { Tag } from 'antd';

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

/* ─── Stat strip ──────────────────────────────────────────────────── */
const StatStrip = ({ stats, loading }) => (
  <div className="wd-stat-strip">
    {[
      { key: 'pending', label: 'Pending',  dot: '#f97316' },
      { key: 'success', label: 'Approved', dot: '#22c55e' },
      { key: 'failed',  label: 'Rejected', dot: '#ef4444' },
    ].map(({ key, label, dot }) => (
      <div key={key} className="wd-stat-item">
        <div className="wd-stat-lbl"><span className="wd-stat-dot" style={{ background: dot }} />{label}</div>
        <div className="wd-stat-val">{loading ? '—' : (stats?.[key]?.count ?? 0)}</div>
        <div className="wd-stat-sub">
          ${loading ? '—' : (stats?.[key]?.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })}
        </div>
      </div>
    ))}
    <div className="wd-stat-item wd-stat-total">
      <div className="wd-stat-lbl"><span className="wd-stat-dot" style={{ background: '#dc2626' }} />Total Withdrawn</div>
      <div className="wd-stat-val" style={{ color: '#dc2626' }}>
        ${loading ? '—' : (stats?.totalWithdrawn ?? 0).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })}
      </div>
      <div className="wd-stat-sub">all time approved</div>
    </div>
  </div>
);

/* ─── Styles ──────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

  .wd-root { font-family:'IBM Plex Sans',sans-serif; background:#f8f9fb; min-height:100vh; }

  .wd-toolbar { background:#fff; border-bottom:1.5px solid #e4e7ec; padding:14px 20px 12px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
  .wd-title    { font-size:15px; font-weight:700; letter-spacing:-.3px; color:#111827; font-family:'IBM Plex Mono',monospace; }
  .wd-subtitle { font-size:11px; color:#6b7280; font-family:'IBM Plex Mono',monospace; margin-top:1px; }

  .wd-quick-strip { background:#fff; padding:8px 20px; border-bottom:1px solid #e4e7ec; display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
  .wd-qd-label { font-size:10.5px; color:#9ca3af; font-family:'IBM Plex Mono',monospace; margin-right:4px; flex-shrink:0; }
  .wd-qd-btn { padding:3px 11px; border-radius:20px; border:1.5px solid #e4e7ec; font-size:11px; font-family:'IBM Plex Mono',monospace; cursor:pointer; background:#fff; color:#374151; transition:all .13s; font-weight:500; white-space:nowrap; }
  .wd-qd-btn:hover  { border-color:#1558b0; color:#1558b0; }
  .wd-qd-btn.active { background:#1558b0; color:#fff; border-color:#1558b0; }

  .wd-stat-strip { background:#f9fafb; border-bottom:1px solid #e4e7ec; padding:8px 20px; display:flex; gap:0; align-items:stretch; }
  .wd-stat-item { display:flex; flex-direction:column; padding:0 24px 0 0; }
  .wd-stat-item + .wd-stat-item { padding-left:24px; border-left:1px solid #e4e7ec; }
  .wd-stat-total { margin-left:auto; }
  .wd-stat-lbl { font-size:10px; text-transform:uppercase; letter-spacing:.7px; color:#9ca3af; font-family:'IBM Plex Mono',monospace; margin-bottom:2px; display:flex; align-items:center; gap:5px; }
  .wd-stat-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
  .wd-stat-val { font-family:'IBM Plex Mono',monospace; font-size:16px; font-weight:700; color:#111827; line-height:1; }
  .wd-stat-sub { font-family:'IBM Plex Mono',monospace; font-size:10px; color:#6b7280; margin-top:2px; }

  .wd-filters-row { background:#fff; padding:10px 20px; border-bottom:1px solid #e4e7ec; display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
  .wd-table-wrap  { padding:16px 20px; }

  .ant-table-thead > tr > th { background:#f1f3f7 !important; font-family:'IBM Plex Mono',monospace !important; font-size:11px !important; font-weight:600 !important; color:#374151 !important; text-transform:uppercase !important; letter-spacing:.5px !important; border-bottom:2px solid #d1d5db !important; padding:10px 12px !important; }
  .ant-table-tbody > tr > td { font-size:12.5px; padding:9px 12px !important; border-bottom:1px solid #f0f0f0 !important; }
  .ant-table-tbody > tr:hover > td { background:#f9fafb !important; }
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
const Withdrawal = () => {
  const [totalWithdrawal, setTotalWithdrawal] = useState(0);
  const [withdrawal, setWithdrawal]           = useState([]);
  const [stats, setStats]                     = useState(null);
  const [statsLoading, setStatsLoading]       = useState(false);
  const [quickPreset, setQuickPreset]         = useState('all');
  const [actionLoading, setActionLoading]     = useState(false);
  const [loading, setLoading]                 = useState({ table: false });
  const [modalState, setModalState]           = useState({ visible: false, type: '', data: null });

  const [queryObjects, setQueryObjects] = useState({
    search: '', from: '', to: '', status: 'pending', currentPage: 1, pageSize: 10,
  });

  /* ── Close modal first, then refresh ── */
  const handleConfirm = async (txid) => {
    const { type, data } = modalState;
    const status = type === 'approve' ? 'success' : 'failed';
    setActionLoading(true);
    try {
      await adminPatch('/withdrawals', {
        status,
        id: data._id,
        ...(txid && txid.length && { txid }),
      });
      setModalState({ visible: false, type: '', data: null });
      await fetchWithdrawal();
      await fetchStats();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Columns ── */
  const getColumns = () => [
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
      title: 'Date', dataIndex: 'createdAt', key: 'createdAt', width: 140,
      render: (text) => (
        <span style={{ fontFamily:'IBM Plex Mono', fontSize:11.5, color:'#6b7280' }}>{formatDate(text)}</span>
      ),
    },
    {
      title: 'User', dataIndex: 'userId', key: 'userId', width: 200,
      render: (text) => <span style={{ fontSize: 12 }}>{text?.email}</span>,
    },
    {
      title: 'Amount', dataIndex: 'amount', key: 'amount', width: 110,
      render: (text) => (
        <span style={{ fontFamily:'IBM Plex Mono', fontWeight:700, color:'#dc2626', fontSize:13 }}>
          -${text}
        </span>
      ),
    },
    {
      title: 'Payment Mode', dataIndex: 'paymentMode', key: 'paymentMode', width: 140,
      render: (text) => <span style={{ fontSize:12, textTransform:'capitalize' }}>{text}</span>,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 110,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Receive Address', dataIndex: 'receiveAddress', key: 'receiveAddress',
      render: (text) => <Text code style={{ fontSize: 11 }}>{text}</Text>,
    },
    {
      title: 'TxID', dataIndex: 'txid', key: 'txid',
      render: (text) => <Text code style={{ fontSize: 11 }}>{text}</Text>,
    },
    {
      title: 'Actions', key: '_id', width: 160,
      render: (_t, record) =>
        record.status === 'pending' ? (
          <div style={{ display:'flex', gap:6 }}>
            <Button size="small" type="primary"
              style={{ background:'#16a34a', borderColor:'#16a34a' }}
              onClick={() => setModalState({ visible:true, type:'approve', data:record })}>
              Approve
            </Button>
            <Button size="small" danger
              onClick={() => setModalState({ visible:true, type:'reject', data:record })}>
              Reject
            </Button>
          </div>
        ) : null,
    },
  ];

  /* ── Fetch ── */
  const fetchWithdrawal = async () => {
    setLoading((p) => ({ ...p, table: true }));
    try {
      const { search, from, to, status, currentPage, pageSize } = queryObjects;
      const response = await adminGet(
        `/withdrawals?search=${encodeURIComponent(search)}&from=${from}&to=${to}&status=${status}&currentPage=${currentPage}&pageSize=${pageSize}`
      );
      if (response) {
        setWithdrawal(response.result);
        setTotalWithdrawal(response.total || response.result.length);
      }
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    } finally {
      setLoading((p) => ({ ...p, table: false }));
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const { from, to } = queryObjects;
      const response = await adminGet(`/withdrawals/stats?from=${from}&to=${to}`);
      if (response?.success) setStats(response.stats);
    } catch (error) {
      console.error('Failed to fetch withdrawal stats:', error);
    }
    setStatsLoading(false);
  };

  useEffect(() => {
    fetchWithdrawal();
    fetchStats();
  }, [queryObjects]);

  /* ── Handlers ── */
  const handleQuickPreset = (preset) => {
    setQuickPreset(preset);
    setQueryObjects((p) => ({ ...p, ...quickRangeToUTC(preset), currentPage: 1 }));
  };

  const handleStatusChange = (e) =>
    setQueryObjects((p) => ({ ...p, status: e.target.value.toLowerCase(), currentPage: 1 }));

  const handleDateRange = (dates) => {
    setQuickPreset('');
    if (!dates) {
      setQueryObjects((p) => ({ ...p, from: '', to: '' }));
    } else {
      const [start, end] = dates;
      setQueryObjects((p) => ({
        ...p,
        from: istStartOfDay(start.year(), start.month(), start.date()).toISOString(),
        to:   istEndOfDay(end.year(), end.month(), end.date()).toISOString(),
        currentPage: 1,
      }));
    }
  };

  const handleSearch = (value) =>
    setQueryObjects((p) => ({ ...p, search: value, currentPage: 1 }));

  return (
    <>
      <style>{STYLES}</style>
      <div className="wd-root">

        {/* Toolbar */}
        <div className="wd-toolbar">
          <div>
            <div className="wd-title">Withdrawal History</div>
            <div className="wd-subtitle">{totalWithdrawal} total withdrawals</div>
          </div>
        </div>

        {/* Quick date preset strip */}
        <div className="wd-quick-strip">
          <span className="wd-qd-label">Range (IST):</span>
          {QUICK_PRESETS.map((p) => (
            <button
              key={p.value}
              className={`wd-qd-btn${quickPreset === p.value ? ' active' : ''}`}
              onClick={() => handleQuickPreset(p.value)}
            >
              {p.label}
            </button>
          ))}
          <span className="wd-qd-label" style={{ marginLeft:10 }}>Custom:</span>
          <RangePicker size="small" style={{ width:240 }} onChange={handleDateRange} />
        </div>

        {/* Stats strip */}
        <StatStrip stats={stats} loading={statsLoading} />

        {/* Filters */}
        <div className="wd-filters-row">
          <Radio.Group onChange={handleStatusChange} defaultValue="pending">
            <Radio.Button value="">All</Radio.Button>
            <Radio.Button value="pending">Pending</Radio.Button>
            <Radio.Button value="success">Approved</Radio.Button>
            <Radio.Button value="failed">Rejected</Radio.Button>
          </Radio.Group>
          <Search
            placeholder="Transaction ID / User email"
            allowClear
            onSearch={handleSearch}
            style={{ width: 280 }}
          />
        </div>

        {/* Table */}
        <div className="wd-table-wrap">
          <Table
            scroll={{ x:'max-content' }}
            loading={loading.table}
            columns={getColumns()}
            dataSource={withdrawal}
            rowKey="_id"
            size="middle"
            pagination={{
              current: queryObjects.currentPage,
              pageSize: queryObjects.pageSize,
              total: totalWithdrawal,
              showSizeChanger: true,
              pageSizeOptions: ['10','20','50'],
              showTotal: (total) => `Total ${total} records`,
              onChange: (page, pageSize) =>
                setQueryObjects((p) => ({ ...p, currentPage:page, pageSize })),
            }}
          />
        </div>
      </div>

      <ConfirmModal
        visible={modalState.visible}
        type={modalState.type}
        onConfirm={handleConfirm}
        onCancel={() => setModalState({ visible:false, type:'', data:null })}
        loading={actionLoading}
        title={`Confirm ${modalState.type === 'approve' ? 'Approve' : 'Reject'}`}
        content={`Are you sure you want to ${modalState.type === 'approve' ? 'approve' : 'reject'} this withdrawal? This action cannot be undone.`}
      />
    </>
  );
};

export default Withdrawal;
import React, { useEffect, useState } from 'react';
import { Input, Modal, Table, DatePicker, Typography } from 'antd';
import { adminGet, adminPost } from '../../services/adminApi';
import { formatDate } from '../../services/formatDate';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Text } = Typography;

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

/* ─── Styles ──────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

  .usr-root { font-family:'IBM Plex Sans',sans-serif; background:#f8f9fb; min-height:100vh; }

  .usr-toolbar { background:#fff; border-bottom:1.5px solid #e4e7ec; padding:14px 20px 12px; display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:10px; }
  .usr-title    { font-size:15px; font-weight:700; letter-spacing:-.3px; color:#111827; font-family:'IBM Plex Mono',monospace; }
  .usr-subtitle { font-size:11px; color:#6b7280; font-family:'IBM Plex Mono',monospace; margin-top:1px; }

  .usr-quick-strip { background:#fff; padding:8px 20px; border-bottom:1px solid #e4e7ec; display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
  .usr-qd-label { font-size:10.5px; color:#9ca3af; font-family:'IBM Plex Mono',monospace; margin-right:4px; flex-shrink:0; }
  .usr-qd-btn { padding:3px 11px; border-radius:20px; border:1.5px solid #e4e7ec; font-size:11px; font-family:'IBM Plex Mono',monospace; cursor:pointer; background:#fff; color:#374151; transition:all .13s; font-weight:500; white-space:nowrap; }
  .usr-qd-btn:hover  { border-color:#1558b0; color:#1558b0; }
  .usr-qd-btn.active { background:#1558b0; color:#fff; border-color:#1558b0; }

  .usr-filters-row { background:#fff; padding:10px 20px; border-bottom:1px solid #e4e7ec; display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
  .usr-table-wrap  { padding:16px 20px; }

  .usr-email-link { color:#1558b0; cursor:pointer; font-size:12.5px; font-weight:500; }
  .usr-email-link:hover { text-decoration:underline; color:#0f44a0; }

  .usr-mono { font-family:'IBM Plex Mono',monospace; font-size:12px; }
  .usr-date  { font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#6b7280; }
  .usr-amt   { font-family:'IBM Plex Mono',monospace; font-weight:700; font-size:12.5px; }

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
const Users = () => {
  const [usersList, setUsersList]     = useState([]);
  const [loading, setLoading]         = useState(false);
  const [totalUsers, setTotalUsers]   = useState(0);
  const [quickPreset, setQuickPreset] = useState('all');
  const [changeEmail, setChangeEmail] = useState({
    show: false, user_id: '', newEmail: '', loading: false,
  });
  const [queryObjects, setQueryObjects] = useState({
    search: '', from: '', to: '', currentPage: 1, pageSize: 10,
  });

  /* ── Columns ── */
  const columns = [
    {
      title: '#', key: 'index', width: 52,
      render: (_t, _r, i) => (
        <span className="usr-mono" style={{ color: '#9ca3af', fontSize: 11 }}>
          {(queryObjects.currentPage - 1) * queryObjects.pageSize + i + 1}
        </span>
      ),
    },
    {
      title: 'Email', dataIndex: 'email', key: 'email',
      render: (text, record) => (
        <span
          className="usr-email-link"
          onClick={() => setChangeEmail((p) => ({ ...p, show: true, user_id: record._id }))}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Phone', dataIndex: 'phone', key: 'phone',
      render: (text) => <span className="usr-mono">{text}</span>,
    },
    {
      title: 'Join Date', dataIndex: 'createdAt', key: 'createdAt', width: 140,
      render: (text) => <span className="usr-date">{formatDate(text)}</span>,
    },
    {
      title: 'Available', dataIndex: 'availableBalance', key: 'availableBalance', width: 120,
      render: (text) => (
        <span className="usr-amt" style={{ color: '#16a34a' }}>${Math.floor(text).toFixed(2)}</span>
      ),
    },
    {
      title: 'Processing', dataIndex: 'processing', key: 'processing', width: 120,
      render: (text) => (
        <span className="usr-amt" style={{ color: '#ea580c' }}>${Math.floor(text).toFixed(2)}</span>
      ),
    },
    {
      title: 'Dispute', dataIndex: 'disputeAmount', key: 'disputeAmount', width: 110,
      render: (text) => (
        <span className="usr-amt" style={{ color: '#dc2626' }}>${Math.floor(text).toFixed(2)}</span>
      ),
    },
  ];

  /* ── Fetch ── */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { search, from, to, currentPage, pageSize } = queryObjects;
      const response = await adminGet(
        `/users?search=${encodeURIComponent(search)}&from=${from}&to=${to}&currentPage=${currentPage}&pageSize=${pageSize}`
      );
      if (response) {
        setUsersList(response.users);
        setTotalUsers(response.total || response.users.length);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [queryObjects]);

  /* ── Email change ── */
  const submitNewEmail = async () => {
    setChangeEmail((p) => ({ ...p, loading: true }));
    try {
      const response = await adminPost('/change-email', {
        newEmail: changeEmail.newEmail,
        user_id: changeEmail.user_id,
      });
      if (response) fetchUsers();
    } catch (error) {
      console.error(error);
    } finally {
      setChangeEmail({ show: false, user_id: '', newEmail: '', loading: false });
    }
  };

  /* ── Handlers ── */
  const handleQuickPreset = (preset) => {
    setQuickPreset(preset);
    setQueryObjects((p) => ({ ...p, ...quickRangeToUTC(preset), currentPage: 1 }));
  };

  const handleSearch = (value) =>
    setQueryObjects((p) => ({ ...p, search: value, currentPage: 1 }));

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

  return (
    <>
      <style>{STYLES}</style>
      <div className="usr-root">

        {/* Toolbar */}
        <div className="usr-toolbar">
          <div>
            <div className="usr-title">Users</div>
            <div className="usr-subtitle">{totalUsers} registered users</div>
          </div>
        </div>

        {/* Quick date preset strip */}
        <div className="usr-quick-strip">
          <span className="usr-qd-label">Joined (IST):</span>
          {QUICK_PRESETS.map((p) => (
            <button
              key={p.value}
              className={`usr-qd-btn${quickPreset === p.value ? ' active' : ''}`}
              onClick={() => handleQuickPreset(p.value)}
            >
              {p.label}
            </button>
          ))}
          <span className="usr-qd-label" style={{ marginLeft: 10 }}>Custom:</span>
          <RangePicker size="small" style={{ width: 240 }} onChange={handleDateRange} />
        </div>

        {/* Filters */}
        <div className="usr-filters-row">
          <Search
            placeholder="Search email / phone"
            allowClear
            onSearch={handleSearch}
            style={{ width: 280 }}
          />
        </div>

        {/* Table */}
        <div className="usr-table-wrap">
          <Table
            loading={loading}
            columns={columns}
            dataSource={usersList}
            rowKey="_id"
            size="middle"
            scroll={{ x: 'max-content' }}
            pagination={{
              current: queryObjects.currentPage,
              pageSize: queryObjects.pageSize,
              total: totalUsers,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Total ${total} users`,
              onChange: (page, pageSize) =>
                setQueryObjects((p) => ({ ...p, currentPage: page, pageSize })),
            }}
          />
        </div>
      </div>

      {/* Change Email Modal */}
      <Modal
        title={
          <span style={{ fontFamily:'IBM Plex Mono, monospace', fontSize:13, fontWeight:600 }}>
            Change Email Address
          </span>
        }
        open={changeEmail.show}
        confirmLoading={changeEmail.loading}
        okText="Update Email"
        okButtonProps={{ style: { background:'#1558b0', borderColor:'#1558b0' } }}
        onOk={submitNewEmail}
        onCancel={() => setChangeEmail({ show:false, user_id:'', newEmail:'', loading:false })}
        destroyOnClose
      >
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize:12, display:'block', marginBottom:6 }}>
            New email address
          </Text>
          <Input
            placeholder="user@example.com"
            value={changeEmail.newEmail}
            onChange={(e) => setChangeEmail((p) => ({ ...p, newEmail: e.target.value }))}
            onPressEnter={submitNewEmail}
          />
        </div>
      </Modal>
    </>
  );
};

export default Users;
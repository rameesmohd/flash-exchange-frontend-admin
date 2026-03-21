import React, { useEffect, useState } from 'react';
import { Button, Table, Select, message, Typography, Tag } from 'antd';
import { adminGet, adminPatch } from '../../services/adminApi';
import { formatDate } from '../../services/formatDate';
import AddFundDrawer from '../../components/AddFundDrawer';

const { Text } = Typography;

/* ─── Status config ───────────────────────────────────────────────── */
const statusConfig = {
  active:   { color: 'green',  label: 'Active'   },
  inactive: { color: 'red',    label: 'Inactive' },
  stockout: { color: 'orange', label: 'Stockout' },
};

/* ─── Styles ──────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

  .fund-root { font-family:'IBM Plex Sans',sans-serif; background:#f8f9fb; min-height:100vh; }

  .fund-toolbar { background:#fff; border-bottom:1.5px solid #e4e7ec; padding:14px 20px 12px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
  .fund-title    { font-size:15px; font-weight:700; letter-spacing:-.3px; color:#111827; font-family:'IBM Plex Mono',monospace; }
  .fund-subtitle { font-size:11px; color:#6b7280; font-family:'IBM Plex Mono',monospace; margin-top:1px; }

  .fund-table-wrap { padding:16px 20px; }

  .fund-type { font-family:'IBM Plex Mono',monospace; font-size:12.5px; font-weight:700; color:#1558b0; }
  .fund-mono { font-family:'IBM Plex Mono',monospace; font-size:12px; }
  .fund-date { font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#6b7280; }
  .fund-rate { font-family:'IBM Plex Mono',monospace; font-size:13px; font-weight:700; color:#111827; }

  .ant-table-thead > tr > th { background:#f1f3f7 !important; font-family:'IBM Plex Mono',monospace !important; font-size:11px !important; font-weight:600 !important; color:#374151 !important; text-transform:uppercase !important; letter-spacing:.5px !important; border-bottom:2px solid #d1d5db !important; padding:10px 12px !important; }
  .ant-table-tbody > tr > td { font-size:12.5px; padding:9px 12px !important; border-bottom:1px solid #f0f0f0 !important; }
  .ant-table-tbody > tr:hover > td { background:#f9fafb !important; }
`;

/* ═══════════════════════════════════════════════════════════════════ */
const Funds = () => {
  const [fundList, setFundList]           = useState([]);
  const [loading, setLoading]             = useState(false);
  const [totalFunds, setTotalFunds]       = useState(0);
  const [editingRecord, setEditingRecord] = useState(null);
  const [spin, setSpin]                   = useState(false);
  const [queryObjects, setQueryObjects]   = useState({ currentPage: 1, pageSize: 10 });

  /* ── Status change ── */
  const handleStatusChange = async (newStatus, record) => {
    setSpin(true);
    try {
      const response = await adminPatch(`/fund/${record._id}/update-status`, { status: newStatus });
      if (response.success) {
        message.success('Status updated');
        fetchFunds();
      }
    } catch (err) {
      message.error('Failed to update status');
      console.error(err);
    } finally {
      setSpin(false);
    }
  };

  /* ── Columns ── */
  const columns = [
    {
      title: '#', key: 'index', width: 52,
      render: (_t, _r, i) => (
        <span className="fund-mono" style={{ color:'#9ca3af', fontSize:11 }}>
          {(queryObjects.currentPage - 1) * queryObjects.pageSize + i + 1}
        </span>
      ),
    },
    {
      title: 'Type', dataIndex: 'type', key: 'type', width: 130,
      render: (text) => <span className="fund-type">{text}</span>,
    },
    {
      title: 'Date', dataIndex: 'createdAt', key: 'createdAt', width: 140,
      render: (text) => <span className="fund-date">{text && formatDate(text)}</span>,
    },
    {
      title: 'Rate / USDT', dataIndex: 'rate', key: 'rate', width: 130,
      render: (text) => <span className="fund-rate">₹{Math.floor(text).toFixed(2)}</span>,
    },
    {
      title: 'Mode', dataIndex: 'paymentMode', key: 'paymentMode', width: 120,
      render: (text) => (
        <span className="fund-mono" style={{ textTransform:'capitalize' }}>{text}</span>
      ),
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 150,
      render: (currentVal, record) => (
        <Select
          loading={spin}
          value={currentVal}
          size="small"
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(value, record)}
          options={Object.entries(statusConfig).map(([value, { color, label }]) => ({
            value,
            label: (
              <Tag
                color={color}
                style={{ borderRadius:4, fontWeight:500, fontSize:11, margin:0 }}
              >
                {label}
              </Tag>
            ),
            disabled: currentVal === value,
          }))}
        />
      ),
    },
    {
      title: 'Max Fulfillment', dataIndex: 'maxFulfillmentTime', key: 'maxFulfillmentTime', width: 150,
      render: (text) => (
        <span className="fund-mono" style={{ color:'#6b7280' }}>
          {Number(text).toFixed(2)} hrs
        </span>
      ),
    },
    {
      title: 'Telegram Channel', dataIndex: 'teleChannel', key: 'teleChannel',
      render: (text) => <span className="fund-mono">{text}</span>,
    },
    {
      title: '', key: 'action', width: 60,
      render: (_t, record) => (
        <Button
          type="link"
          size="small"
          style={{ padding:0, color:'#1558b0', fontFamily:'IBM Plex Mono, monospace', fontSize:12 }}
          onClick={() => setEditingRecord(record)}
        >
          Edit
        </Button>
      ),
    },
  ];

  /* ── Fetch ── */
  const fetchFunds = async () => {
    setLoading(true);
    try {
      const response = await adminGet('/fund');
      if (response) {
        setFundList(response.funds);
        setTotalFunds(response.funds?.length || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFunds(); }, [queryObjects]);

  return (
    <>
      <style>{STYLES}</style>
      <div className="fund-root">

        {/* Toolbar */}
        <div className="fund-toolbar">
          <div>
            <div className="fund-title">Funds</div>
            <div className="fund-subtitle">
              {totalFunds} fund type{totalFunds !== 1 ? 's' : ''} · manage rates and availability
            </div>
          </div>
          <AddFundDrawer
            editingRecord={editingRecord}
            onCloseDrawer={() => setEditingRecord(null)}
            onSuccess={fetchFunds}
          />
        </div>

        {/* Table */}
        <div className="fund-table-wrap">
          <Table
            loading={loading}
            columns={columns}
            dataSource={fundList}
            rowKey="_id"
            size="middle"
            scroll={{ x:'max-content' }}
            pagination={{
              current: queryObjects.currentPage,
              pageSize: queryObjects.pageSize,
              total: totalFunds,
              showSizeChanger: true,
              pageSizeOptions: ['10','20','50'],
              showTotal: (total) => `Total ${total} records`,
              onChange: (page, pageSize) =>
                setQueryObjects((prev) => ({ ...prev, currentPage:page, pageSize })),
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Funds;
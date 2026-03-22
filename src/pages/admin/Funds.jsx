import React, { useEffect, useState, useCallback } from 'react';
import { Button, Table, Select, message, Typography, Tag, Drawer, Input, Popconfirm, Spin, Empty } from 'antd';
import { DeleteOutlined, UserAddOutlined, TeamOutlined, HolderOutlined } from '@ant-design/icons';
import { adminGet, adminPatch, adminPost, adminDelete, adminPut } from '../../services/adminApi';
import { formatDate } from '../../services/formatDate';
import AddFundDrawer from '../../components/AddFundDrawer';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

const { Text } = Typography;

const statusConfig = {
  active:   { color: 'green',  label: 'Active'   },
  inactive: { color: 'red',    label: 'Inactive' },
  stockout: { color: 'orange', label: 'Stockout' },
};

const fundTypeConfig = {
  gateway: { color: '#1558b0', bg: '#eff6ff', label: 'Gateway' },
  clean:   { color: '#15803d', bg: '#f0fdf4', label: 'Clean'   },
  bank:    { color: '#92400e', bg: '#fffbeb', label: 'Bank'     },
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

  .fund-root { font-family:'IBM Plex Sans',sans-serif; background:#f8f9fb; min-height:100vh; }
  .fund-toolbar { background:#fff; border-bottom:1.5px solid #e4e7ec; padding:14px 20px 12px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
  .fund-title    { font-size:15px; font-weight:700; letter-spacing:-.3px; color:#111827; font-family:'IBM Plex Mono',monospace; }
  .fund-subtitle { font-size:11px; color:#6b7280; font-family:'IBM Plex Mono',monospace; margin-top:1px; }
  .fund-table-wrap { padding:16px 20px; }

  .fund-drag-handle { display:inline-flex; align-items:center; justify-content:center;
    width:24px; height:28px; color:#d1d5db; cursor:grab; border-radius:4px;
    transition:color .12s, background .12s; }
  .fund-drag-handle:hover { color:#6b7280; background:#f1f5f9; }
  .fund-drag-handle:active { cursor:grabbing; color:#1558b0; }

  .fund-row-dragging > td { background:#eff6ff !important; box-shadow:0 4px 20px rgba(21,88,176,0.12) !important; }
  .fund-row-dragging > td:first-child { border-left:2.5px solid #1558b0; }

  .fund-code { font-family:'IBM Plex Mono',monospace; font-size:12px; font-weight:700; color:#374151; background:#f1f5f9; border-radius:5px; padding:2px 8px; display:inline-block; letter-spacing:1px; }
  .fund-type-chip { border-radius:6px; padding:2px 9px; font-size:11px; font-weight:700; font-family:'IBM Plex Mono',monospace; display:inline-block; }
  .fund-mono { font-family:'IBM Plex Mono',monospace; font-size:12px; }
  .fund-date { font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#6b7280; }
  .fund-rate { font-family:'IBM Plex Mono',monospace; font-size:13px; font-weight:700; color:#111827; }

  .ant-table-thead > tr > th { background:#f1f3f7 !important; font-family:'IBM Plex Mono',monospace !important; font-size:11px !important; font-weight:600 !important; color:#374151 !important; text-transform:uppercase !important; letter-spacing:.5px !important; border-bottom:2px solid #d1d5db !important; padding:10px 12px !important; }
  .ant-table-tbody > tr > td { font-size:12.5px; padding:9px 12px !important; border-bottom:1px solid #f0f0f0 !important; }
  .ant-table-tbody > tr:hover > td { background:#f9fafb !important; }

  .reorder-hint { display:flex; align-items:center; gap:5px; font-size:10.5px; color:#9ca3af; font-family:'IBM Plex Mono',monospace; }
  .reorder-saving { display:flex; align-items:center; gap:6px; font-size:11px; color:#1558b0; font-family:'IBM Plex Mono',monospace; }
  .reorder-spin { width:10px; height:10px; border-radius:50%; border:1.5px solid #bfdbfe; border-top-color:#1558b0; animation:rspin .7s linear infinite; flex-shrink:0; }
  @keyframes rspin { to { transform:rotate(360deg); } }

  .au-add-row { display:flex; gap:8px; margin-bottom:16px; }
  .au-list { display:flex; flex-direction:column; gap:6px; }
  .au-item { display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; gap:8px; }
  .au-email { font-size:13px; color:#111827; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .au-open-badge { display:inline-flex; align-items:center; gap:4px; font-size:11px; color:#16a34a; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:3px 10px; }
`;

/* ─── Sortable table row ──────────────────────────────────────────── */
const SortableRow = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props['data-row-key'] });

  const style = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { zIndex: 9999, position: 'relative' } : {}),
  };

  return (
    <tr
      {...props}
      ref={setNodeRef}
      style={style}
      className={`${props.className || ''} ${isDragging ? 'fund-row-dragging' : ''}`}
    >
      {React.Children.map(props.children, (child) => {
        // Inject drag listeners into the handle cell (key === 'drag')
        if (child?.key === 'drag') {
          return React.cloneElement(child, {
            children: (
              <span className="fund-drag-handle" {...attributes} {...listeners}>
                <HolderOutlined />
              </span>
            ),
          });
        }
        return child;
      })}
    </tr>
  );
};

/* ─── AllowedUsersDrawer ──────────────────────────────────────────── */
const AllowedUsersDrawer = ({ fund, onClose, onRefresh }) => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [adding, setAdding]     = useState(false);
  const [removing, setRemoving] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const load = async () => {
    if (!fund) return;
    setLoading(true);
    try {
      const res = await adminGet(`/fund/${fund._id}/allowed-users`);
      if (res.success) setUsers(res.allowedUsers);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (fund) { setUsers([]); setNewEmail(''); load(); }
  }, [fund?._id]);

  const handleAdd = async () => {
    if (!newEmail.trim()) return;
    setAdding(true);
    try {
      const res = await adminPost(`/fund/${fund._id}/allowed-users`, {
        emails: newEmail.split(',').map(e => e.trim()).filter(Boolean),
      });
      if (res.success) { setUsers(res.allowedUsers); setNewEmail(''); onRefresh(); }
      else message.error(res.message || 'Failed to add');
    } catch (e) { message.error('Failed to add user'); }
    finally { setAdding(false); }
  };

  const handleRemove = async (email) => {
    setRemoving(email);
    try {
      const res = await adminDelete(`/fund/${fund._id}/allowed-users?email=${encodeURIComponent(email)}`);
      if (res.success) { setUsers(res.allowedUsers); onRefresh(); }
    } catch (e) { message.error('Failed to remove'); }
    finally { setRemoving(''); }
  };

  const handleClearAll = async () => {
    try {
      const res = await adminPut(`/fund/${fund._id}/allowed-users/clear`, {});
      if (res.success) {
        setUsers([]);
        onRefresh();
        message.success('Whitelist cleared — fund is now open to all users');
      }
    } catch (e) { message.error('Failed to clear'); }
  };

  return (
    <Drawer
      title={
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <TeamOutlined style={{ color:'#1558b0' }} />
          <span style={{ fontFamily:'IBM Plex Mono, monospace', fontSize:13 }}>Allowed Users</span>
          {fund && (
            <span style={{ fontFamily:'monospace', fontSize:11, background:'#f1f5f9',
              borderRadius:4, padding:'1px 7px', color:'#64748b' }}>
              {fund.code}
            </span>
          )}
        </div>
      }
      open={!!fund}
      onClose={onClose}
      width={400}
      destroyOnClose
    >
      {fund && (
        <>
          <div style={{ marginBottom:14 }}>
            {users.length === 0 ? (
              <span className="au-open-badge">✓ Open to all users (no restrictions)</span>
            ) : (
              <Text type="secondary" style={{ fontSize:12 }}>
                {users.length} user{users.length !== 1 ? 's' : ''} whitelisted · only they can see this fund
              </Text>
            )}
          </div>

          <div className="au-add-row">
            <Input
              placeholder="user@example.com (comma-separate multiple)"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              onPressEnter={handleAdd}
              size="small"
            />
            <Button type="primary" size="small" icon={<UserAddOutlined />}
              loading={adding} onClick={handleAdd}
              style={{ background:'#1558b0', borderColor:'#1558b0', flexShrink:0 }}>
              Add
            </Button>
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:32 }}><Spin /></div>
          ) : users.length === 0 ? (
            <Empty description="No whitelist — fund visible to all"
              imageStyle={{ height:40 }} style={{ padding:'24px 0' }} />
          ) : (
            <div className="au-list">
              {users.map(email => (
                <div key={email} className="au-item">
                  <span className="au-email">{email}</span>
                  <Popconfirm title="Remove this user?" onConfirm={() => handleRemove(email)}
                    okText="Remove" okButtonProps={{ danger: true }}>
                    <Button size="small" danger type="text" icon={<DeleteOutlined />}
                      loading={removing === email} />
                  </Popconfirm>
                </div>
              ))}
            </div>
          )}

          {users.length > 0 && (
            <Popconfirm title="Clear whitelist? Fund will become visible to ALL users."
              onConfirm={handleClearAll} okText="Clear All" okButtonProps={{ danger: true }}>
              <Button danger style={{ marginTop:16, width:'100%' }} size="small">
                Clear Whitelist (open to all)
              </Button>
            </Popconfirm>
          )}
        </>
      )}
    </Drawer>
  );
};

/* ═══════════════════════════════════════════════════════════════════ */
const Funds = () => {
  const [fundList, setFundList]           = useState([]);
  const [loading, setLoading]             = useState(false);
  const [totalFunds, setTotalFunds]       = useState(0);
  const [editingRecord, setEditingRecord] = useState(null);
  const [allowedFund, setAllowedFund]     = useState(null);
  const [spin, setSpin]                   = useState(false);
  const [saving, setSaving]               = useState(false);
  const [queryObjects, setQueryObjects]   = useState({ currentPage: 1, pageSize: 10 });

  // Require 6px movement before drag starts — prevents accidental drags on clicks
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleStatusChange = async (newStatus, record) => {
    setSpin(true);
    try {
      const response = await adminPatch(`/fund/${record._id}/update-status`, { status: newStatus });
      if (response.success) { message.success('Status updated'); fetchFunds(); }
    } catch (err) { message.error('Failed to update status'); }
    finally { setSpin(false); }
  };

  const handleDragEnd = useCallback(async ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = fundList.findIndex(f => f._id === active.id);
    const newIndex = fundList.findIndex(f => f._id === over.id);
    const reordered = arrayMove(fundList, oldIndex, newIndex);

    setFundList(reordered); // instant optimistic update

    setSaving(true);
    try {
      await adminPatch('/fund/reorder', { orderedIds: reordered.map(f => f._id) });
    } catch {
      message.error('Failed to save order');
      fetchFunds(); // revert on failure
    } finally {
      setSaving(false);
    }
  }, [fundList]);

  const columns = [
    {
      key: 'drag',   // SortableRow looks for this key to inject listeners
      width: 36,
      render: () => (
        <span className="fund-drag-handle">
          <HolderOutlined />
        </span>
      ),
    },
    {
      title: '#', key: 'index', width: 44,
      render: (_t, _r, i) => (
        <span className="fund-mono" style={{ color:'#9ca3af', fontSize:11 }}>
          {(queryObjects.currentPage - 1) * queryObjects.pageSize + i + 1}
        </span>
      ),
    },
    { title: 'Code', dataIndex: 'code', key: 'code', width: 80,
      render: (text) => <span className="fund-code">{text}</span> },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 130,
      render: (text) => <span className="fund-mono" style={{ fontWeight:600, color:'#1558b0' }}>{text}</span> },
    { title: 'Fund Type', dataIndex: 'fundType', key: 'fundType', width: 110,
      render: (text) => {
        const cfg = fundTypeConfig[text] || fundTypeConfig.gateway;
        return <span className="fund-type-chip" style={{ color:cfg.color, background:cfg.bg }}>{cfg.label}</span>;
      },
    },
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', width: 130,
      render: (text) => <span className="fund-date">{text && formatDate(text)}</span> },
    { title: 'Rate / USDT', dataIndex: 'rate', key: 'rate', width: 120,
      render: (text) => <span className="fund-rate">₹{Math.floor(text).toFixed(2)}</span> },
    { title: 'Mode', dataIndex: 'paymentMode', key: 'paymentMode', width: 90,
      render: (text) => <span className="fund-mono" style={{ textTransform:'capitalize' }}>{text}</span> },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 150,
      render: (currentVal, record) => (
        <Select loading={spin} value={currentVal} size="small" variant="borderless" style={{ width:120 }}
          onChange={(value) => handleStatusChange(value, record)}
          options={Object.entries(statusConfig).map(([value, { color, label }]) => ({
            value,
            label: <Tag color={color} style={{ borderRadius:4, fontWeight:500, fontSize:11, margin:0, width:'100%' }}>{label}</Tag>,
            disabled: currentVal === value,
          }))} />
      ),
    },
    {
      title: 'Users', dataIndex: 'allowedUsers', key: 'allowedUsers', width: 90,
      render: (list, record) => (
        <Button size="small" type="text" icon={<TeamOutlined />}
          style={{ color: list?.length > 0 ? '#1558b0' : '#9ca3af', padding:0, fontSize:12 }}
          onClick={() => setAllowedFund(record)}>
          {list?.length > 0 ? list.length : 'All'}
        </Button>
      ),
    },
    { title: 'Max', dataIndex: 'maxFulfillmentTime', key: 'maxFulfillmentTime', width: 80,
      render: (text) => <span className="fund-mono" style={{ color:'#6b7280' }}>{Number(text).toFixed(0)}h</span> },
    { title: 'Channel', dataIndex: 'teleChannel', key: 'teleChannel',
      render: (text) => <span className="fund-mono" style={{ color:'#6b7280' }}>{text}</span> },
    {
      title: '', key: 'action', width: 60,
      render: (_t, record) => (
        <Button type="link" size="small"
          style={{ padding:0, color:'#1558b0', fontFamily:'IBM Plex Mono, monospace', fontSize:12 }}
          onClick={() => setEditingRecord(record)}>
          Edit
        </Button>
      ),
    },
  ];

  const fetchFunds = async () => {
    setLoading(true);
    try {
      const response = await adminGet('/fund');
      if (response) { setFundList(response.funds); setTotalFunds(response.funds?.length || 0); }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFunds(); }, [queryObjects]);

  return (
    <>
      <style>{STYLES}</style>
      <div className="fund-root">

        <div className="fund-toolbar">
          <div>
            <div className="fund-title">Funds</div>
            <div className="fund-subtitle">
              {totalFunds} fund type{totalFunds !== 1 ? 's' : ''} · manage rates, receipts and access
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {saving ? (
              <div className="reorder-saving">
                <div className="reorder-spin" />
                Saving order…
              </div>
            ) : (
              <div className="reorder-hint">
                <HolderOutlined /> Drag to reorder
              </div>
            )}
            <AddFundDrawer
              editingRecord={editingRecord}
              onCloseDrawer={() => setEditingRecord(null)}
              onSuccess={fetchFunds}
            />
          </div>
        </div>

        <div className="fund-table-wrap">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fundList.map(f => f._id)}
              strategy={verticalListSortingStrategy}
            >
              <Table
                loading={loading}
                columns={columns}
                dataSource={fundList}
                rowKey="_id"
                size="middle"
                scroll={{ x:'max-content' }}
                components={{ body: { row: SortableRow } }}
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
            </SortableContext>
          </DndContext>
        </div>
      </div>

      <AllowedUsersDrawer
        fund={allowedFund}
        onClose={() => setAllowedFund(null)}
        onRefresh={fetchFunds}
      />
    </>
  );
};

export default Funds;
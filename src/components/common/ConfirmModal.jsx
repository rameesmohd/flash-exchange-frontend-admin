// components/common/ConfirmModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Input, Typography } from 'antd';

const { Text } = Typography;

const ConfirmModal = ({
  visible,
  type,
  onConfirm,
  onCancel,
  loading,
  title,
  content,
  order,
  showUTR = false,
}) => {
  const [fulfilledFiat, setFulfilledFiat] = useState('');
  const [utr, setUtr]                     = useState('');

  // Reset on open
  useEffect(() => {
    if (visible) {
      setFulfilledFiat(order?.fiat ? String(order.fiat) : '');
      setUtr('');
    }
  }, [visible, order]);

  const handleOk = () => {
    onConfirm(fulfilledFiat, utr); // FIX #2: pass utr as 2nd arg
  };

  return (
    <Modal
      open={visible}
      title={title}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}  // FIX #1: uses actionLoading, not table loading
      okText={type === 'approve' ? 'Approve' : 'Reject'}
      okButtonProps={{
        danger: type === 'reject',
        style: type === 'approve' ? { background: '#16a34a', borderColor: '#16a34a' } : {},
      }}
      destroyOnClose
    >
      <Text>{content}</Text>

      {type === 'approve' && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              Fulfilled Amount (₹) — leave blank to use full order amount ₹{order?.fiat}
            </Text>
            <Input
              type="number"
              prefix="₹"
              value={fulfilledFiat}
              onChange={(e) => setFulfilledFiat(e.target.value)}
              placeholder={`${order?.fiat ?? ''}`}
              min={0}
            />
          </div>

          {/* FIX #2: UTR field */}
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              UTR Number
            </Text>
            <Input
              type=''
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              placeholder="Enter UTR / reference number"
              maxLength={30}
              style={{ fontFamily: 'IBM Plex Mono, monospace', letterSpacing: 1 }}
            />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ConfirmModal;
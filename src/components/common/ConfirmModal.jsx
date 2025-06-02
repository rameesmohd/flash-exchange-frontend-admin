import React from 'react';
import { Modal, Button } from 'antd';

const ConfirmModal = ({
  visible,
  title = "Are you sure?",
  content = "Do you really want to perform this action?",
  onConfirm,
  onCancel,
  confirmText = "Yes",
  cancelText = "Cancel",
  loading = false,
}) => {
  return (
    <Modal
      title={title}
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={confirmText}
      cancelText={cancelText}
      centered
       okButtonProps={{ style: { backgroundColor: '#1890ff', borderColor: '#1890ff', color: '#fff' } }}
    >
      {content}
    </Modal>
  );
};

export default ConfirmModal;

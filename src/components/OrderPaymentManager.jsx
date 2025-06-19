import React, { useState } from 'react';
import {
  Button,
  Divider,
  Image,
  Input,
  message,
  Modal,
  Progress,
  Typography,
  Upload
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { adminPatch, adminPost } from '../services/adminApi';

const { Text } = Typography;

const getBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

const OrderPaymentManager = ({ order, onSuccess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState([]);

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

  const handleUpload = async ({ file, onSuccess, onError }) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'unsigned_preset');
    data.append('folder', 'order-screenshots');

    try {
      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/dj5inosqh/image/upload',
        data
      );
      file.url = res.data.secure_url;
      file.public_id = res.data.public_id;
      onSuccess(res.data, file);
    } catch (err) {
      console.error('Upload error:', err);
      message.error('Upload failed.');
      onError(err);
    }
  };

  const handleRemove = async file => {
    if (!file.public_id) return;
    try {
      await adminPost('/delete-image', { public_id: file.public_id });
      return true;
    } catch (err) {
      console.error('Delete failed:', err);
      message.error('Failed to delete image');
      return false;
    }
  };

  const handleSaveUrls = async () => {
    const urls = fileList.filter(file => file.url).map(file => file.url);
    try {
      const response = await adminPost(`/orders/${order._id}/screenshots`, { urls });
      if (response.success) {
        onSuccess()
        setFileList([]);
        message.success('Screenshots saved to order');
      }
    } catch (err) {
      console.error(err);
      message.error('Failed to save screenshots');
    }
  };

  const addPayment = async () => {
    setLoading(true);
    try {
      const response = await adminPatch(`/order/${order._id}/add-payment`, {
        amount: Number(amount),
      });
      if (response.success) {
        onSuccess()
        message.success('Payment added successfully');
      }
    } catch (error) {
      console.error(error);
      message.error(error.message || 'Failed to add payment');
    } finally {
      setLoading(false);
      setAmount(0);
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <>
      <Button size="small" type="default" onClick={showModal}>
        Add Payment
      </Button>

      <Modal
        title="Manage Order Payment & Screenshots"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Close
          </Button>,
        ]}
      >
        <Text>
          Progress Of Order ₹{order.fulfilledFiat} / ₹{order.fiat} Completed
        </Text>
        <Progress percent={order.fulfilledRatio * 100} size="small" />
        <Divider />

        <Text>Add Amount Completed</Text>
        <Input
          value={amount > 0 && amount}
          onChange={e => setAmount(e.target.value)}
          size="large"
          type="number"
          placeholder="Enter ₹ amount"
        />
        <Button
          loading={loading}
          onClick={addPayment}
          size="middle"
          type="primary"
          className="bg-blue-500 my-3"
        >
          Add Funds
        </Button>

        <Divider />
        <Text>Upload Payment Screenshots</Text>
        <Upload
          customRequest={handleUpload}
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
          onRemove={handleRemove}
          multiple
        >
          {fileList.length >= 8 ? null : uploadButton}
        </Upload>

        {previewImage && (
          <Image
            wrapperStyle={{ display: 'none' }}
            preview={{
              visible: previewOpen,
              onVisibleChange: visible => setPreviewOpen(visible),
              afterOpenChange: visible => !visible && setPreviewImage(''),
            }}
            src={previewImage}
          />
        )}

        <Button
          type="primary"
          className="bg-blue-500 mt-2"
          onClick={handleSaveUrls}
          disabled={fileList.length === 0}
        >
          Save Screenshots
        </Button>
      </Modal>
    </>
  );
};

export default OrderPaymentManager;

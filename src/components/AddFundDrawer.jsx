import React, { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Drawer, Form, Input, message, Row, Select, Space } from 'antd';
import { adminPatch, adminPost } from '../services/adminApi';

const AddFundDrawer = ({ editingRecord = null, onCloseDrawer, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const selectedPaymentMode = Form.useWatch('paymentMode', form);

  useEffect(() => {
    if (editingRecord) {
      setOpen(true);
      form.setFieldsValue(editingRecord);
    }
  }, [editingRecord]);

  const onClose = () => {
    setOpen(false);
    form.resetFields();
    if (onCloseDrawer) onCloseDrawer();
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const apiCall = editingRecord
        ? () => adminPatch(`/fund`,{id: editingRecord._id, values})
        : () => adminPost('/fund', values);

      const response = await apiCall();

      if (response.success) {
        message.success(editingRecord ? 'Fund updated' : 'Fund added');
        if (onSuccess) onSuccess(); // trigger refetch
        onClose();
      } else {
        message.error('Something went wrong');
      }
    } catch (error) {
      const errMsg = error?.response?.data?.message || 'Request failed';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="primary"
        className="bg-blue-500"
        onClick={()=>setOpen(true)}
        icon={<PlusOutlined />}
      >
        Add Fund
      </Button>

      <Drawer
        title={editingRecord ? 'Edit Fund' : 'Add Fund'}
        width={520}
        onClose={onClose}
        open={open}
        destroyOnClose
        styles={{ body: { paddingBottom: 80 } }}
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              loading={loading}
              className="bg-blue-500"
              type="primary"
              onClick={() => form.submit()}
            >
              Submit
            </Button>
          </Space>
        }
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          initialValues={{
            type: '',
            rate: '',
            maxFulfillmentTime: '',
            teleChannel: '',
            teleApi: '',
            message: '',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Type"
                rules={[{ required: true, message: 'Please enter fund type' }]}
              >
                <Input placeholder="e.g. Gaming Fund" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="rate"
                label="Rate"
                rules={[{ required: true, message: 'Please enter rate' }]}
              >
                <Input placeholder="e.g. 25.5" type="number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxFulfillmentTime"
                label="Max Fulfillment Time (Hours)"
                rules={[{ required: true, message: 'Please enter max hours' }]}
              >
                <Input placeholder="e.g. 2" type="number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="teleChannel"
                label="Telegram Channel"
              >
                <Input placeholder="@channelname" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="teleApi"
                label="Telegram API Key"
              >
                <Input placeholder="e.g. 123456:ABC-DEF..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="message"
                label="Message"
                rules={[
                  { required: false, message: 'Please enter a message' },
                ]}
              >
                <Input.TextArea rows={4} placeholder="Optional message to display..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="paymentMode"
                label="Payment Mode"
                rules={[{ required: true, message: 'Please select payment mode' }]}
              >
                <Select
                  placeholder="Select a payment mode"
                  value={selectedPaymentMode} 
                  options={[
                      { value: 'bank', label: 'Bank', disabled: selectedPaymentMode === 'bank' },
                      { value: 'upi', label: 'UPI', disabled: selectedPaymentMode === 'upi' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

        </Form>
      </Drawer>
    </>
  );
};

export default AddFundDrawer;

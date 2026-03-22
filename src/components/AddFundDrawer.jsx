import React, { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Drawer, Form, Input, message, Row, Select, Space } from 'antd';
import { adminPatch, adminPost } from '../services/adminApi';

const FUND_TYPE_OPTIONS = [
  { value: 'gateway', label: 'Gateway' },
  { value: 'clean',   label: 'Clean'   },
  { value: 'bank',    label: 'Bank'    },
];

const CODE_HINTS = {
  gateway: 'e.g. GW01, GW02',
  clean:   'e.g. CF01, CF02',
  bank:    'e.g. BT01, BT02',
};

const AddFundDrawer = ({ editingRecord = null, onCloseDrawer, onSuccess }) => {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const selectedPaymentMode = Form.useWatch('paymentMode', form);
  const selectedFundType    = Form.useWatch('fundType', form);

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
        ? () => adminPatch(`/fund`, { id: editingRecord._id, values })
        : () => adminPost('/fund', values);

      const response = await apiCall();

      if (response.success) {
        message.success(editingRecord ? 'Fund updated' : 'Fund added');
        if (onSuccess) onSuccess();
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
        style={{ background: '#1558b0', borderColor: '#1558b0' }}
        onClick={() => setOpen(true)}
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
              type="primary"
              style={{ background: '#1558b0', borderColor: '#1558b0' }}
              onClick={() => form.submit()}
            >
              {editingRecord ? 'Update' : 'Submit'}
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
            fundType: undefined,
            code: '',
            paymentMode: undefined,
          }}
        >
          {/* Type + Rate */}
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
                label="Rate (₹ per USDT)"
                rules={[{ required: true, message: 'Please enter rate' }]}
              >
                <Input placeholder="e.g. 85.50" type="number" prefix="₹" />
              </Form.Item>
            </Col>
          </Row>

          {/* Fund Type + Code */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fundType"
                label="Fund Type"
                rules={[{ required: true, message: 'Please select fund type' }]}
                extra={
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    Determines which receipt template is used
                  </span>
                }
              >
                <Select
                  placeholder="Select fund type"
                  options={FUND_TYPE_OPTIONS}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Fund Code"
                rules={[
                  { required: true, message: 'Please enter fund code' },
                  { pattern: /^[A-Z0-9]{2,8}$/, message: 'Uppercase letters and numbers only, 2–8 chars' },
                ]}
                extra={
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    {CODE_HINTS[selectedFundType] || 'e.g. GW01, CF01, BT01'}
                  </span>
                }
              >
                <Input
                  placeholder={CODE_HINTS[selectedFundType] || 'e.g. GW01'}
                  style={{ fontFamily: 'monospace', fontWeight: 600, letterSpacing: 1 }}
                  onChange={e =>
                    form.setFieldValue('code', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Payment Mode + Max Fulfillment */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="paymentMode"
                label="Payment Mode"
                rules={[{ required: true, message: 'Please select payment mode' }]}
              >
                <Select
                  placeholder="Select payment mode"
                  options={[
                    { value: 'bank', label: 'Bank', disabled: selectedPaymentMode === 'bank' },
                    { value: 'upi',  label: 'UPI',  disabled: selectedPaymentMode === 'upi'  },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxFulfillmentTime"
                label="Max Fulfillment (Hours)"
                rules={[{ required: true, message: 'Please enter max hours' }]}
              >
                <Input placeholder="e.g. 2" type="number" suffix="hrs" />
              </Form.Item>
            </Col>
          </Row>

          {/* Telegram */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="teleChannel" label="Telegram Channel ID">
                <Input placeholder="-100....." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="teleApi" label="Telegram API Key">
                <Input placeholder="123456:ABC-DEF..." />
              </Form.Item>
            </Col>
          </Row>

          {/* Message */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="message" label="Message">
                <Input.TextArea rows={3} placeholder="Optional message to display to users..." style={{ resize: 'none' }} />
              </Form.Item>
            </Col>
          </Row>

        </Form>
      </Drawer>
    </>
  );
};

export default AddFundDrawer;
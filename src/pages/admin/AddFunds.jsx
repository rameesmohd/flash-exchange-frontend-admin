import { Input, Button, Form, Card, Select, Flex, Typography, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { adminPost } from '../../services/adminApi';

const { Title, Text } = Typography;

const AddFunds = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isDisable, setDisable] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      setDisable(true);
      const res = await adminPost('/add-to-wallet', values);
      if(res.success){
        message.success(res.message)
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const payment_modes = ['main wallet', 'usdt-trc20', 'usdt-bep20', 'usdt-erc20'];
  const types = ['deposit', 'transfer'];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <Title level={4} style={{ margin: 0, lineHeight: 1.3 }}>
            Add Funds to User
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Manually credit a user's wallet balance
          </Text>
        </div>

        <Card
          style={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
          bodyStyle={{ padding: '24px' }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>

            <Form.Item
              label="User Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter user email' },
                { type: 'email', message: 'Enter a valid email address' },
              ]}
            >
              <Input type='' placeholder="user@example.com" />
            </Form.Item>

            <Form.Item
              label="Amount"
              name="amount"
              rules={[
                { required: true, message: 'Please enter an amount' },
                {
                  validator: (_, value) =>
                    value && Number(value) > 0
                      ? Promise.resolve()
                      : Promise.reject('Amount must be greater than 0'),
                },
              ]}
            >
              <Input type="number" min={0} placeholder="0.00" prefix="$" />
            </Form.Item>

            <Form.Item label="Comment" name="comment">
              <Input.TextArea
                placeholder="Enter a comment (optional)"
                rows={3}
                style={{ resize: 'none' }}
              />
            </Form.Item>

            {/* Divider */}
            <div
              style={{
                borderTop: '1px solid #f0f0f0',
                margin: '4px 0 16px',
              }}
            />

            <Form.Item
              label={
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LockOutlined style={{ color: '#6b7280', fontSize: 12 }} />
                  Admin Transaction PIN
                </span>
              }
              name="transactionPin"
              rules={[
                { required: true, message: 'Transaction PIN is required to authorize this action' },
                { len: 6, message: 'PIN must be exactly 6 digits' },
                { pattern: /^\d+$/, message: 'PIN must contain digits only' },
              ]}
            >
              <Input.Password
                maxLength={6}
                placeholder="Enter your 6-digit PIN"
                style={{ letterSpacing: 6, fontWeight: 600, width: 280 }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                disabled={isDisable}
                htmlType="submit"
                loading={loading}
                block
                style={{ background: '#3b82f6', borderColor: '#3b82f6', height: 38 }}
              >
                {isDisable ? 'Funds Added' : 'Add Funds'}
              </Button>
            </Form.Item>

          </Form>
        </Card>
      </div>
    </div>
  );
};

export default AddFunds;
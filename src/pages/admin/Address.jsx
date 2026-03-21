import React, { useEffect, useState } from 'react';
import { adminGet } from '../../services/adminApi';
import { Card, Tag, Typography, Button, Radio, Skeleton, Empty } from 'antd';
import { EditOutlined, CopyOutlined } from '@ant-design/icons';
import { formatDate } from '../../services/formatDate';
import AddAddressDrawer from '../../components/AddAddressDrawer';

const { Text, Title } = Typography;

const Address = () => {
  const [addressList, setAddressList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [value, setValue] = useState('Active');

  const fetchAddress = async () => {
    try {
      setLoading(true);
      const response = await adminGet(`/address?status=${value.toLowerCase()}`);
      if (response.success) {
        setAddressList(response.result);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddress();
  }, [value]);

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0, lineHeight: 1.3 }}>
            Company Addresses
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Manage deposit receiving addresses
          </Text>
        </div>
        <Radio.Group
          value={value}
          onChange={({ target: { value } }) => setValue(value)}
          optionType="button"
          buttonStyle="solid"
          options={['Active', 'Inactive']}
        />
      </div>

      {/* Address Cards */}
      {loading ? (
        [1, 2, 3].map((i) => (
          <Card
            key={i}
            style={{ borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 12 }}
            bodyStyle={{ padding: 20 }}
          >
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
        ))
      ) : addressList.length === 0 ? (
        <Card
          style={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
          bodyStyle={{ padding: 48 }}
        >
          <Empty description={`No ${value.toLowerCase()} addresses found`} />
        </Card>
      ) : (
        addressList.map((item, index) => (
          <Card
            key={index}
            style={{
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              marginBottom: 12,
              background: '#fff',
            }}
            bodyStyle={{ padding: '16px 20px' }}
          >
            {/* Top row: Priority + Address + Edit */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              {/* Left: Priority badge + address */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#1d4ed8',
                    flexShrink: 0,
                  }}
                >
                  {item.priority}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 2 }}>
                    TRC-20 Address
                  </Text>
                  <Text strong copyable style={{ fontSize: 13 }}>
                    {item.address}
                  </Text>
                </div>
              </div>

              {/* Right: Edit button */}
              <Button
                icon={<EditOutlined />}
                size="small"
                type="primary"
                style={{ background: '#3b82f6', borderColor: '#3b82f6', flexShrink: 0 }}
                onClick={() => setEditingRecord(item)}
              >
                Edit
              </Button>
            </div>

            {/* Divider */}
            <div
              style={{ borderTop: '1px solid #f0f0f0', margin: '12px 0' }}
            />

            {/* Meta row: Flag + Status + Timestamps */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Tag
                  color={item.flag ? 'red' : 'orange'}
                  style={{ borderRadius: 4, fontWeight: 500, fontSize: 12, margin: 0 }}
                >
                  ⚑ Flag: {`${item.flag}` || 'None'}
                </Tag>
                <Tag
                  color={item.status === 'active' ? 'green' : 'default'}
                  style={{ borderRadius: 4, fontWeight: 500, fontSize: 12, margin: 0, textTransform: 'capitalize' }}
                >
                  {item.status || 'None'}
                </Tag>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Created: {item.createdAt && formatDate(item.createdAt)}
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Updated: {item.updatedAt && formatDate(item.updatedAt)}
                </Text>
              </div>
            </div>
          </Card>
        ))
      )}

      <AddAddressDrawer
        editingRecord={editingRecord}
        onCloseDrawer={() => setEditingRecord(null)}
        onSuccess={fetchAddress}
      />
    </div>
  );
};

export default Address;
import React, { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
  Switch,
} from 'antd';
import { adminPatch, adminPost } from '../services/adminApi';

const AddAddressDrawer = ({ editingRecord = null, onCloseDrawer, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const selectedPriority = Form.useWatch('priority', form);

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
        ? () => adminPatch('/address', { _id: editingRecord._id, ...values })
        : () => adminPost('/address', values);

      const response = await apiCall();

      if (response.success) {
        message.success(editingRecord ? 'Address updated' : 'Address added');
        if (onSuccess) onSuccess(); // trigger parent update
        onClose();
      } else {
        message.error(response.message || 'Something went wrong');
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
        className="text-center my-auto w-full cursor-pointer bg-gray-700 text-white rounded-lg"
        onClick={() => setOpen(true)}
        icon={<PlusOutlined />}
      >
        Add Address
      </Button>

      <Drawer
        title={editingRecord ? 'Edit Address' : 'Add Address'}
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
            address: '',
            priority: null,
            flag: true,
            status: 'active',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: 'Please enter address' }]}
              >
                <Input disabled={editingRecord!=null} type='' placeholder="Enter wallet address" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: 'Please select priority' }]}
              >
                <Select
                  placeholder="Select priority"
                  value={selectedPriority}
                  options={Array.from({ length: 10 }, (_, i) => ({
                    value: i + 1,
                    label: `${i + 1}`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="flag"
                label="Flag"
                valuePropName="checked"
              >
                <Switch className="bg-gray-300" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
              >
                <Select
                  options={[
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                  ]}
                  placeholder="Select status"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};

export default AddAddressDrawer;

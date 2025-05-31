import { Input, Button, Form, Card, Select, Flex } from 'antd';
import React, { useState } from 'react';
import { adminPost } from '../../services/adminApi';

const AddFunds = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isDisable,setDisable]=useState(false)

  const handleSubmit = async(values) => {
    console.log("Form Data:", values);
    
    setLoading(true);
    try {
        await adminPost('/add-to-wallet',values)
    } catch (error) {
        console.log(error);
    } finally {
        setLoading(false);
        setDisable(true)
    }
  };

  const payment_modes = ['main wallet','usdt-trc20','usdt-bep20','usdt-erc20'];
  const types = ['deposit','transfer']
  return (
    <Card title="Add Funds to User" className="w-full max-w-lg mx-auto mt-6 shadow-md">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="User Email"
          name="email"
          rules={[{ required: true, message: 'Please enter user email!' }]}
        >
          <Input placeholder="Enter user email" />
        </Form.Item>

        <Form.Item
          label="Amount"
          name="amount"
          rules={[{ required: true, message: 'Please enter an amount!' }]}
        >
          <Input type="number" placeholder="Enter amount" />
        </Form.Item>

        <Form.Item
          label="Comment"
          name="comment"
        >
          <Input.TextArea placeholder="Enter a comment (optional)" />
        </Form.Item>

        <Flex>
        <Form.Item label="Payment Mode" name="payment_mode">
          <Select
            style={{ width: 150 }}
            placeholder="Select Payment Mode"
            options={payment_modes.map((mode) => ({ label: mode, value: mode }))}
            allowClear
            />
        </Form.Item>
        <Form.Item className='mx-2' label="Type" name="type">
          <Select
            style={{ width: 150 }}
            placeholder="Select Payment type"
            options={types.map((mode) => ({ label: mode, value: mode }))}
            allowClear
          />
        </Form.Item>
        </Flex>

        <Form.Item>
          <Button disabled={isDisable} htmlType="submit" loading={loading} block>
            Add Funds
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AddFunds;

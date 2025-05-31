import React, { useState } from 'react';
import { Input, Button, Form, Card, message } from 'antd';
import { adminPost } from '../../services/adminApi';

const { TextArea } = Input;

const SendEmail = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSend = async (values) => {
    setLoading(true);
    try {
      const res = await adminPost('/send-email',values);
      if (res.success) {
        message.success('Email sent successfully!');
        form.resetFields();
      } else {
        message.error('Failed to send email');
      }
    } catch (error) {
      message.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Send Email" className="max-w-2xl mx-auto my-4">
      <Form layout="vertical" form={form} onFinish={handleSend}>
        <Form.Item
          label="To"
          name="to"
          rules={[{ required: true, message: 'Please enter recipient email' }]}
        >
          <Input  placeholder="example@mail.com" />
        </Form.Item>

        <Form.Item
          label="Subject"
          name="subject"
          rules={[{ required: true, message: 'Please enter subject' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please enter username' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Please enter title' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Description One"
          name="desOne"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <TextArea rows={6} placeholder="Enter your message..." />
        </Form.Item>

        <Form.Item
          label="Description Two"
          name="desTwo"
          rules={[{ required: false, message: 'Please enter description' }]}
        >
          <TextArea rows={6} placeholder="Enter your message..." />
        </Form.Item>

        <Form.Item
          label="Description Three"
          name="desThree"
          rules={[{ required: false, message: 'Please enter description' }]}
        >
          <TextArea rows={6} placeholder="Enter your message..." />
        </Form.Item>

        <Form.Item>
          <Button type="default" htmlType="submit" loading={loading}>
            Send Email
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SendEmail;

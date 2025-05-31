import React, { useEffect } from 'react';
import { Button, Col, DatePicker, Drawer, Form, Input, Row, Select, Space } from 'antd';
const { Option } = Select;
import moment from 'moment'; 


const App = ({ role, open, setOpen, formData = {}, submitHandler ,loading}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (role === 'edit' && formData) {
      const updatedFormData = {
        ...formData,
        joined_at: formData.joined_at ? moment(formData.joined_at) : null, 
      };
      form.setFieldsValue(updatedFormData);
    } else {
      // form.resetFields(); 
    }
  }, [role, formData, form]);
  

  const onClose = () => {
    setOpen((prev) => ({ ...prev, show: false }));
    form.resetFields();
  };

  const onFinish = async (values) => {
    const formattedValues = {
      ...values,
      _id : formData._id,
      joined_at: values.joined_at ? values.joined_at.toISOString() : null,
    };
    
    await submitHandler(formattedValues);
    onClose();
  };
  
  return (
    <Drawer
      title={role === 'edit' ? 'Edit Provider' : 'Add New Provider'}
      width={720}
      onClose={onClose}
      open={open}
      bodyStyle={{ paddingBottom: 80 }}
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
          // loading={loading}
           onClick={() => form.submit()} className="border">
            {role === 'edit' ? 'Update' : 'Submit'}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        hideRequiredMark
        onFinish={onFinish}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="username" label="User Name" rules={[{ required: true, message: 'Please enter user name' }]}>
              <Input placeholder="Please enter user name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter password' }]}>
              <Input placeholder="Password" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="nickname" label="Nickname" rules={[{ required: true, message: 'Please enter nickname' }]}>
              <Input placeholder="Nickname" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="manager_id" label="Manager Id" rules={[{ message: 'Please enter user_id' }]}>
              <Input placeholder="632458" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="img_url" label="Profile image url " rules={[{ required: true, message: 'Please enter img_url' }]}>
              <Input placeholder="632458" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          {[
            { name: 'platform', label: 'Platform', options: ['mt4', 'mt5'] },
            { name: 'account_type', label: 'Account Type', options: ['standard', 'raw'] },
            { name: 'trading_interval', label: 'Trading Interval', options: ['weekly', 'daily', 'monthly'] },
            { name: 'leverage', label: 'Leverage', options: ['1:50', '1:100', '1:200', '1:500', '1:1000'] },
          ].map(({ name, label, options }) => (
            <Col span={6} key={name}>
              <Form.Item name={name} label={label} rules={[{ required: true, message: `Please choose ${label}` }]}>
                <Select placeholder={`Please choose ${label}`}>
                  {options.map((opt) => (
                    <Option key={opt} value={opt}>{opt}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          ))}
        </Row>

        <Row gutter={16}>
          <Col span={7}>
            <Form.Item name="performance_fees_percentage" label="Performance Fees (%)" rules={[{ required: true, message: 'Please enter performance fees' }]}>
              <Input placeholder="0%" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="security_deposit" label="Security Deposit (USD)" rules={[{ required: true, message: 'Please enter security deposit' }]}>
              <Input placeholder="1000 USD" />
            </Form.Item>
          </Col>
          <Col span={9}>
            <Form.Item name="joined_at" label="Joined At" rules={[{ required: true, message: 'Please choose a date' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter description' }]}>
          <Input.TextArea rows={4} placeholder="Please enter description" />
        </Form.Item>

        <Row gutter={16}>
          {[
            { name: 'open_trade_profit', label: 'Open Trade Profit ($)' },
            { name: 'closed_trade_profit', label: 'Closed Trade Profit ($)' },
            { name: 'total_trade_profit', label: 'Total Trade Profit ($)' },
            { name: 'total_funds', label: 'Total Funds ($)' },
          ].map(({ name, label }) => (
            <Col span={6} key={name}>
              <Form.Item name={name} label={label} rules={[{ required: true, message: `Please enter ${label.toLowerCase()}` }]}>
                <Input placeholder="1" />
              </Form.Item>
            </Col>
          ))}
        </Row>

        <Row gutter={16}>
          {[
            { name: 'risks', label: 'Risks (1-10)' },
            { name: 'compound', label: 'Compound (%)' },
            { name: 'total_return', label: 'Return (%)' },
            { name: 'total_investors', label: 'Total Investors Count' },
            { name: 'win_rate', label: 'Win Rate (%)' },
            { name: 'min_initial_investment', label: 'Min Initial Investment' },
            { name: 'referral', label: 'Referral Share(%)' },
            { name: 'min_withdrawal', label: 'Min Withdrawl' },
            { name: 'min_top_up', label: 'Min Topup' },
            { name: 'max_drawdown', label: 'Max Drawdown' },
            { name: 'trading_liquidity_period', label: 'Investment Liquidity Period' },
          ].map(({ name, label }) => (
            <Col span={7} key={name}>
              <Form.Item name={name} label={label} rules={[{ required: true, message: `Please enter ${label.toLowerCase()}` }]}>
                <Input placeholder="1" />
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Form>
    </Drawer>
  );
};

export default App;

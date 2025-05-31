import React, { useEffect } from 'react';
import { Button, Col, DatePicker, Drawer, Form, Input, Row, Select, Space } from 'antd';
const { Option } = Select;
import moment from 'moment'; 

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

const App = ({ role, open, setOpen, formData = {}, submitHandler ,loading}) => {
  const [form] = Form.useForm();
  console.log(formData);

  const onClose = () => {
    setOpen((prev) => ({ ...prev, show: false }));
    form.resetFields();
  };

  const onFinish = async (values) => {
    const formattedValues = {
      ...values,
      open_time: values.open_time.format('YYYY-MM-DD HH:mm:ss'),
      close_time: values.close_time.format('YYYY-MM-DD HH:mm:ss'),
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
           loading={loading}
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
        <Row gutter={16} className='my-4'>
            {[
               { name: 'symbol', 
                label: 'Symbol', 
                options: [
                'GBP/USD',
                'EUR/USD',
                'USD/JPY',
                'AUD/USD',
                'USD/CAD',
                'USD/CHF',
                'XAU/USD' ]},
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

            {[
               { name: 'type', label: 'Type', options: ['buy', 'sell'] }
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


        <Row gutter={24}>
          <Col span={6}>
            <Form.Item name="manager_volume" label="Manager Volume(Lot)" rules={[{ required: true, message: 'Please enter trade volume' }]}>
              <Input placeholder="0.01" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="manager_profit" label="Manager Profit($)" rules={[{ required: true, message: 'Please enter manager profit' }]}>
            <Input placeholder="0.654" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="open_price" label="Open Price ($)" rules={[{ required: true, message: 'Please enter open price' }]}>
              <Input placeholder="0.215" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="close_price" label="Close Price($)" rules={[{ required: true, message: 'Please enter close price' }]}>
            <Input placeholder="0.654" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="swap" label="Swap Charge($)" rules={[{ required: true, message: 'Please enter swap charge' }]}>
              <Input placeholder="0" />
            </Form.Item>
          </Col>
        </Row>

          <Row gutter={24}>
            <Col span={12}>
            <Form.Item
            name="open_time"
            label="Trade Open Time(UTC)"
            rules={[{ required: true, message: 'Please choose open time' }]}
          >
              <DatePicker 
                style={{ width: '100%' }} 
                 showTime={{ format: 'HH:mm:ss' }} 
                format={dateFormat}
                placeholder="Select Open Time"
              />
            </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
              name="close_time"
              label="Trade Close Time(UTC)"
              rules={[{ required: true, message: 'Please choose close time' }]}
              >
              <DatePicker 
                style={{ width: '100%' }} 
                 showTime={{ format: 'HH:mm:ss' }} 
                format={dateFormat}
                placeholder="Select Close Time"
                type='button'
              />
              </Form.Item>
            </Col>
          </Row>
        </Form>
    </Drawer>
  );
};

export default App;

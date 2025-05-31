import React, { useState } from 'react'
import InfoRow from './InfoRow';
import { Typography, Space, Collapse } from 'antd';
import { formatDate, formatDateStringAsDate, getCurrentWeekDates } from '../services/formatDate';
import './styles/collapseAntd.css'
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons'; 

const { Panel } = Collapse;
const { Title, Text } = Typography;

const Summary = ({investmentData}) => {
  const [activeKey, setActiveKey] = useState(null); // Track which panel is open

  const handleExpandChange = (key) => {
    // Toggle expansion: close if the same panel is clicked again
    setActiveKey((prevKey) => (prevKey === key ? null : key));
  };

  const {
    manager_nickname = '',
    updatedAt='',
    createdAt='',
    current_interval_profit = 0,
    open_trade_profit = 0,
    closed_trade_profit = 0,
    performance_fee_paid = 0,
    performance_fee_projected=0,
    total_deposit=0,
    total_withdrawal=0,
    net_profit=0,
    total_funds=0,
    current_interval_profit_equity=0
  }=investmentData

  const data = [
    { label: 'Money Manager', value: manager_nickname },
    { label: 'Created', value: formatDateStringAsDate(createdAt)},
    { label: 'Trading interval', value: getCurrentWeekDates() },
    { label: 'Current trading interval profit', value: `$${parseFloat(current_interval_profit).toFixed(2)}`,className : "text-lg text-green-500"},
    { label: 'Open Trades Profit', value: `$${parseFloat(open_trade_profit).toFixed(2)}` },
    { label: 'Closed Trades Profit', value: `$${parseFloat(closed_trade_profit).toFixed(2)}`,className : "text-2xl text-green-500" },
    { label: 'Fees', value: `-$${parseFloat(performance_fee_paid+performance_fee_projected).toFixed(2)}` },
    { label: 'Net Deposit',  value: `$${parseFloat(total_deposit-total_withdrawal) <0 ? 0.00 : parseFloat(total_deposit-total_withdrawal).toFixed(2) }` },
    { label: 'Net Profit', value: `$${parseFloat(net_profit+current_interval_profit ).toFixed(2)}` ,className : "text-2xl text-green-500"},
    { label: 'Funds', value: `$${parseFloat(total_funds+current_interval_profit_equity).toFixed(2)}`}
  ];

  const netDepositDetails = [
    { label: 'Total Deposit', value: `$${parseFloat(total_deposit).toFixed(2)}` },
    { label: 'Total Withdrawal', value: `$${parseFloat(total_withdrawal).toFixed(2)}` },
  ];

  const feeDeatils = [
    { label: 'Total fee paid', value: `$${parseFloat(performance_fee_paid).toFixed(2)}` },
    { label: 'Total fee projected', value: `$${parseFloat(performance_fee_projected).toFixed(2)}` },
  ];

  return (
    <div className='text-gray-500 sm:px-2 md:px-4 lg:px-6'>
      <Space direction="vertical" size="no" className="py-3">
        <Text className='text-xl'>Summary</Text>
        <Text type="secondary">Last update {formatDate(updatedAt)}</Text>
      </Space>
      <div>
      {data.map((item, index) => (
        item.label === 'Net Deposit' ? (
          <Collapse
            key={index}
            bordered={false}
            className="no-padding-collapse"
            onChange={() => handleExpandChange('1')}
            expandIconPosition="start"
            activeKey={activeKey === '1' ? '1' : null}
            expandIcon={() =>   activeKey === '1' ? <CaretUpOutlined /> : <CaretDownOutlined />}
          >
            <Panel
              header={
                <div className="flex items-center  justify-between w-full">
                <span className='text-gray-500'>Net deposit</span>
                <div className="flex-1  mx-2 border-t border-double border-gray-400"></div> 
                <span className="ml-2 text-base font-semibold">{item.value}</span>
              </div>}
              key="1"
              className="no-padding-panel"
            >
              {netDepositDetails.map((detail, idx) => (
                <InfoRow key={idx} label={detail.label} value={detail.value} />
              ))}
            </Panel>
          </Collapse>
        ) : item.label === 'Fees' ? 
            <Collapse
            key={index}
            bordered={false}
            className="no-padding-collapse"
            activeKey={activeKey === '2' ? '2' : null}
            onChange={() => handleExpandChange('2')}
            expandIconPosition="start"
            expandIcon={() => activeKey === '2' ? <CaretUpOutlined /> : <CaretDownOutlined />}
          >
            <Panel
              header={
                <div className="flex items-center  justify-between w-full">
                <span className='text-gray-500'>Fees</span>
                <div className="flex-1  mx-2 border-t border-gray-400"></div> 
                <span className="ml-2 text-base font-semibold">{item.value}</span>
              </div>}
              key="2"
              className="no-padding-panel"
            >
              {feeDeatils.map((detail, idx) => (
                <InfoRow key={idx} label={detail.label} value={detail.value} />
              ))}
            </Panel>
          </Collapse>
        : ((
          <InfoRow className={item?.className} key={index} label={item.label} value={item.value} />
        )
        )))}
    </div>
    </div>
  )
}

export default Summary



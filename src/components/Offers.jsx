import { Card, Divider,Space,Typography } from 'antd';
const {Text} = Typography
import React from 'react'
import InfoRow from './InfoRow';


const formatToTwoDecimals = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const Offers = ({investmentData}) => {
  const {
    trading_interval = 'N/A',
    min_top_up = 0,
    min_withdrawal = 0,
    min_initial_investment = 0,
    manager_performance_fee = 0,
    performance_fee_projected = 0,
    trading_liquidity_period = 'N/A',
  } = investmentData;

  const data = [
    { label: 'Trading Interval', tooltip: 'Frequency of trades', value: trading_interval },
    { label: 'Min. Topup', tooltip: 'Minimum amount to deposit', value: `$${formatToTwoDecimals(min_top_up)}` },
    { label: 'Min. Withdrawal', tooltip: 'Minimum amount to withdraw', value: `$${formatToTwoDecimals(min_withdrawal)}` },
    { label: 'Min. Initial Investment', tooltip: 'Minimum investment to start', value: `$${formatToTwoDecimals(min_initial_investment)}` },
    { label: 'Performance Fee (%)', tooltip: 'Percentage of performance fee', value: `${manager_performance_fee}%` },
    // { label: 'Projected Performance Fee', tooltip: 'Estimated fee amount', value: `$${formatToTwoDecimals(performance_fee_projected)}` },
    { label: 'Performance Fees Equity', tooltip: 'Type of performance fee', value: '$0.00' },
    { label: 'Liquidity Period', tooltip: 'Total investment duration',value: `${ trading_liquidity_period} days` },
  ];

  return (
    <div className='text-gray-500 sm:px-2 md:px-4 lg:px-6'>
      <Space direction="vertical" size="no" className="py-3">
        <Text className='text-xl'>{investmentData && investmentData.manager.nickname}</Text>
        {/* <Text type="secondary">Last update Aug 25, 2024, 4:44:52 AM</Text> */}
      </Space>
    <div className="">
    {data.map((item, index) => (
          <React.Fragment key={index}>
           <InfoRow key={index} tooltip={item.tooltip} label={item.label} value={item.value} />
            {index == 4 && <Divider className="my-4" />}
          </React.Fragment>
    ))}
    </div>
    </div>
  )
}

export default Offers

import React, { useEffect, useState } from 'react'
import { Table, Tag, Typography } from 'antd';
const { Text } = Typography;
import './styles/tradeTable.css'
import { managerGet } from '../services/managerApi';

const Positions = ({investmentData}) => {
  const columns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: 'Volume',
      dataIndex: 'manager_volume',
      key: 'manager_volume',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag className='capitalize' color={type === 'buy' ? 'green' : 'red'} key={type}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Open Time',
      dataIndex: 'open_time',
      key: 'open_time',
    },
    {
      title: 'Close Time',
      dataIndex: 'close_time',
      key: 'close_time',
    },
    {
      title: 'Open Price',
      dataIndex: 'open_price',
      key: 'open_price',
    },
    {
      title: 'Close Price',
      dataIndex: 'close_price',
      key: 'close_price',
    },
    {
      title: 'Swap',
      dataIndex: 'swap',
      key: 'swap',
    },
    {
      title: 'Manager Profit',
      dataIndex: 'manager_profit',
      key: 'manager_profit',
    },
    {
      title: 'Investor Profit',
      dataIndex: 'investor_profit',
      key: 'investor_profit',
    },
  ];


  const [tradeHistory,setTradeHistory]=useState([])
  const [loading,setLoading]=useState(false)

  const fetchTrades =async()=>{
    setLoading(true)
    const response = await managerGet(`/trades?_id=${investmentData._id}`)
    if(response){
      setTradeHistory(response.result)
    }
    setLoading(false)
  }

  useEffect(()=>{
    fetchTrades()
  },[])
  
  return (
    <div>
      <Table
      className="overflow-y-auto custom-table text-gray-500 hide-scrollbar p-0 font-thin"
      columns={columns}
      dataSource={tradeHistory}
      pagination={{ pageSize: 10 }} 
      loading={loading}
    />
    </div>
  )
}

export default Positions

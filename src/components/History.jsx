import React, { useEffect, useState } from 'react'
import { Table, Typography } from 'antd';
const { Text } = Typography;
import './styles/tradeTable.css'
import { managerGet } from '../services/managerApi';
import { formatDate } from '../services/formatDate';

const History = ({investmentData}) => {
  const columns = [
    {
      title: <Text className="header-text font-normal text-gray-500">#</Text>,
      dataIndex: 'transaction_id',
      key: 'transaction_id',
      width: 60,
      align: 'center',
    },
    {
      title: <Text className="header-text font-normal text-gray-500">Type</Text>,
      dataIndex: 'type',
      key: 'type',
      width: 120,
      align: 'center',
      render : (text)=><Text className='capitalize'>{text}</Text>
    },
    {
      title: <Text className="header-text font-normal text-gray-500">Amount</Text>,
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      align: 'right',
      render: (amount) => `$${amount.toFixed(2)}`,
    },
    {
      title: <Text className="header-text font-normal text-gray-500">Status</Text>,
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => (
        <Text className={`capitalize ${status === 'approved' ? 'text-green-500' : status === 'pending' ? 'text-orange-400' : 'text-red-600'}`}>
          {status}
        </Text>
      ),
    },
    {
      title: <Text className="header-text font-normal text-gray-500">Comment</Text>,
      dataIndex: 'comment',
      key: 'comment',
      width: 200,
      align: 'left',
      ellipsis: true, // Truncate long comments with ellipsis
    },
    {
      title: <Text className="header-text font-normal text-gray-500">Last updated</Text>,
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      align: 'center',
      render :(date)=>formatDate(date)
    
    },
  ];

  const [loading,setLoading]=useState(false)
  const [tableData,setTableData]=useState([])


  const fetchTransactions=async()=>{
      const respose = await managerGet(`/transactions?id=${investmentData._id}`)
      if(respose){
        setTableData(respose.result.reverse())  
      }
  }

  useEffect(()=>{ 
    fetchTransactions()
  },[])

  return (
    <div>
    <Table
      loading={loading}
      className="overflow-y-auto custom-table text-gray-500 hide-scrollbar p-0 font-thin"
      columns={columns}
      dataSource={tableData}
      pagination={{ pageSize: 10 }} // Optional: Adds pagination
    />
    </div>
  )
}

export default History

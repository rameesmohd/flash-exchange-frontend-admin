import { Button, DatePicker, Input, Table,Radio, Flex ,Typography, Card} from 'antd';
import React, { useEffect, useState } from 'react'
import {formatDate } from '../../services/formatDate'
import { adminGet, adminPatch } from '../../services/adminApi';
import { Tag } from 'antd';

const { RangePicker } = DatePicker;
const { Search } = Input;
const { Text } = Typography

const getStatusTag = (status) => {
  const statusColors = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
  };

  return <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>;
};

const Orders = () => {
    const [queryObjects, setQueryObjects] = useState({
      search: '',
      from: '',
      to: '',
      status: 'pending',
      currentPage: 1,
      pageSize: 10,
  });
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCompletedAmount,setTotalCompletedAmount]=useState(0)

  const handleWithdrawStatus =async({status,_id})=>{
      try {
        const response = await adminPatch('/orders',{status,_id})
        if(response){
          fetchWithdrawal()
        }
      } catch (error) {
          console.log(error);
      }
  }

  const getColumns = (data) => {
      const columns = [
        {
          title: 'No.',
          key: 'index',
          render : (_text,_record,index)=>index+1
        },
        {
          title: 'Date',
          dataIndex: 'createdAt',
          key: 'createdAt',
          render : (text)=>formatDate(text),
          width : 120
        },
        {
          title: 'order ID',
          dataIndex: 'orderId',
          key: 'orderId',
          render : (text)=> <div>{`#${text}`}</div>
        },
        {
          title: 'USDT',
          dataIndex: 'usdt',
          key: 'usdt',
          render : (text)=> <div>{text} USDT</div>
        },
        {
          title : "Fiat",
          dataIndex : "fiat",
          key : "fiat",
          render : (text)=> <div>{`${text} INR`}</div>
        },
        {
          title: 'Fund',
          dataIndex: 'fund',
          key: 'fund',
          render : (text)=> <div>{`xxx`}</div>
        },
        {
          title: 'Bank Card',
          dataIndex: 'bankCard',
          key: 'bankCard',
          render : (text)=> <Card bodyStyle={{padding : 4,paddingLeft : 12}} className='capitalize '>
            <div>Acc No: {text.accountNumber}</div>  
            <div>IFSC: {text.ifsc}</div>
            <div>Acc Name: {text.accountName}</div>
          </Card>,
          width : 200
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
          render: (status) => getStatusTag(status),
        },
        { 
          title : '',
          key : '_id',
          render : (text,render)=> <div className='flex'>
              {
                render.status=='pending' ? 
              <>
                <Button onClick={()=>handleWithdrawStatus({status : 'approved',_id : render._id})} className='bg-green-500 text-white mx-2'>Approve</Button> 
                <Button onClick={()=>handleWithdrawStatus({status : 'rejected',_id : render._id})}ssName='bg-red-500 text-white'>Reject</Button>
              </> : ""
              }
          </div>
        },
      ];
      return columns;
    };
  const [ Orders,setOrders ]= useState([])
  const [ loading,setLoading ]=useState(false)

  const fetchOrders =async()=>{
      setLoading(true)
      try {
        const { search, from, to, status, currentPage, pageSize } = queryObjects;
        const response = await adminGet(
          `/orders?search=${search}&from=${from}&to=${to}&status=${status}&currentPage=${currentPage}&pageSize=${pageSize}`
        )
        if(response){
          console.log(response);
          setOrders(response.orders)
          setTotalOrders(response.total || response.result.length);
          setTotalCompletedAmount(response.totalCompletedAmount)
        }
      } catch (error) {
        console.error('Failed to fetch Orderss:', error);
      }
      setLoading(false)
  }

  useEffect(()=>{
    fetchOrders()
  },[queryObjects])

  const handleStatusChange = (e) => {
    setQueryObjects((prev) => ({
      ...prev,
      status: e.target.value.toLowerCase(),
      currentPage: 1,
    }));
  };

  const handleDateRange = (dates) => {
    if (!dates) {
      setQueryObjects((prev) => ({ ...prev, from: '', to: '' }));
    } else {
      const [start, end] = dates;
      
      // Convert both to start and end of day in UTC
      const utcStart = new Date(Date.UTC(
        start.year(),
        start.month(),
        start.date(),
        0, 0, 0
      ));
  
      const utcEnd = new Date(Date.UTC(
        end.year(),
        end.month(),
        end.date(),
        23, 59, 59, 999
      ));
  
      setQueryObjects((prev) => ({
        ...prev,
        from: utcStart.toISOString(),
        to: utcEnd.toISOString(),
        currentPage: 1,
      }));
    }
  };

  const handleSearch = (value) => {
    setQueryObjects((prev) => ({
      ...prev,
      search: value,
      currentPage: 1,
    }));
  };

  return (
    <>
        <div className='p-2 my-2'>
        <div className='text-lg mb-2'>Orders History</div>
        <Flex className='flex-col sm:flex-row my-3 items-center' gap={6} justify='space-between'>
          <Radio.Group className='mx-1 w-full flex -z-50' onChange={handleStatusChange} defaultValue='pending'>
            <Radio.Button value=''>All</Radio.Button>
            <Radio.Button value='pending'>Pending</Radio.Button>
            <Radio.Button value='approved'>Approved</Radio.Button>
            <Radio.Button value='rejected'>Rejected</Radio.Button>
          </Radio.Group>
          <RangePicker className='h-8 mx-1 w-full' onChange={handleDateRange} />
          <Search
            className='mx-1 w-full sm:w-96'
            placeholder='email, txid, wallet id'
            allowClear
            onSearch={handleSearch}
            // style={{ width: 300 }}
            />
        </Flex>
        <Text className='font-semibold'>Total Orders : {totalCompletedAmount}</Text>
        <div className=' w-full h-full'>
            <Table
              scroll={{ x: "max-content" }}
              loading={loading} 
              columns={getColumns(Orders)} 
              dataSource={Orders}
              rowKey="_id"
              pagination={{
                current: queryObjects.currentPage,
                pageSize: queryObjects.pageSize,
                total: totalOrders,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total) => `Total ${total} items`,
                onChange: (page, pageSize) =>
                  setQueryObjects((prev) => ({
                    ...prev,
                    currentPage: page,
                    pageSize: pageSize,
                  })),
              }}
            />
        </div>
        </div>
    </>
  )
}

export default Orders

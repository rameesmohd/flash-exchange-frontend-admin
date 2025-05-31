import { Button, DatePicker, Input, Table,Radio, Flex ,Typography} from 'antd';
import React, { useEffect, useState } from 'react'
import {formatDate } from '../../services/formatDate'
import { masterGet, masterPatch } from '../../services/adminApi';
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

const Withdrawal = () => {
    const [queryObjects, setQueryObjects] = useState({
      search: '',
      from: '',
      to: '',
      status: 'pending',
      currentPage: 1,
      pageSize: 10,
  });
  const [totalWithdrawal, setTotalWithdrawal] = useState(0);
    const [totalWithdrawedAmount,setTotalWithdrawedAmount]=useState(0)
  const handleWithdrawStatus =async({status,_id})=>{
      try {
        const response = await masterPatch('/withdrawals',{status,_id})
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
          render : (text)=>formatDate(text)
        },
        {
          title: 'Email',
          dataIndex: 'user',
          key: 'user',
          render : (text)=> <div>{`${text.email}`}</div>
        },
        {
          title: 'Name',
          dataIndex: 'user',
          key: 'user',
          render : (text)=> <div>{`${text.first_name+" "+text.last_name}`}</div>
        },
        {
          title : "Txid",
          dataIndex : "transaction_id",
          key : "transaction_id",
          render : (text)=> <div>{`#${text}`}</div>
        },
        {
          title : "Wallet",
          dataIndex : "wallet_id",
          key : "wallet_id",
          render : (text)=> <div>{`#${text}`}</div>
        },
        {
          title: 'Amount',
          dataIndex: 'amount',
          key: 'amount',
          render : (text)=> <div>{`+$${text}`}</div>
        },
        {
          title: 'Payment Mode',
          dataIndex: 'payment_mode',
          key: 'payment_mode',
          render : (text)=> <div className='capitalize'>{text}</div>
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
          render: (status) => getStatusTag(status),
        },
        { 
          title : 'Recipient Address',
          dataIndex : 'recipient_address',
          key : 'recipient_address',
          
        },
        // {
        //   title: 'User Id',
        //   dataIndex: 'user',
        //   key: 'user',
        //   render : (text)=> <div>{`${text}`}</div>
        // },
        { 
          title : '',
          key : '_id',
          render : (text,render)=> <div className='flex justify-between'>
              {
                render.status=='pending' ? 
              <>
                <Button onClick={()=>handleWithdrawStatus({status : 'approved',_id : render._id})} className='bg-green-500 text-white'>Approve</Button> 
                <Button onClick={()=>handleWithdrawStatus({status : 'rejected',_id : render._id})}ssName='bg-red-500 text-white'>Reject</Button>
              </> : ""
              }
          </div>
        },
      ];
      return columns;
    };
  const [ withdrawal,setWithdrawal ]= useState([])
  const [ loading,setLoading ]=useState(false)

  const fetchWithdrawal =async()=>{
      setLoading(true)
      try {
        const { search, from, to, status, currentPage, pageSize } = queryObjects;
        const response = await masterGet(
          `/withdrawals?search=${search}&from=${from}&to=${to}&status=${status}&currentPage=${currentPage}&pageSize=${pageSize}`
        )
        if(response){
          console.log(response);
          setWithdrawal(response.result)
          setTotalWithdrawal(response.total || response.result.length);
          setTotalWithdrawedAmount(response.totalWithdrawedAmount)
        }
      } catch (error) {
        console.error('Failed to fetch withdrawals:', error);
      }
      setLoading(false)
  }

  useEffect(()=>{
    fetchWithdrawal()
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
        <Flex justify='space-between'>
        <div className='text-lg'>Withdrawals History</div>
        <div className='flex items-center'>
          <RangePicker className='h-8 mx-1' onChange={handleDateRange} />
          <Radio.Group className='mx-1' onChange={handleStatusChange} defaultValue='pending'>
            <Radio.Button value=''>All</Radio.Button>
            <Radio.Button value='pending'>Pending</Radio.Button>
            <Radio.Button value='approved'>Approved</Radio.Button>
            <Radio.Button value='rejected'>Rejected</Radio.Button>
          </Radio.Group>
          <Search
            className='mx-1'
            placeholder='email, txid, wallet id'
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            />
        </div>
        </Flex>
        <Text className='text-red-600 font-semibold'>Total Withdrawal : {totalWithdrawedAmount}</Text>
        <div className=' w-full h-full'>
            <Table
              scroll={{ x: "max-content" }}
              loading={loading} 
              columns={getColumns(withdrawal)} 
              dataSource={withdrawal} 
              rowKey="_id"
              pagination={{
                current: queryObjects.currentPage,
                pageSize: queryObjects.pageSize,
                total: totalWithdrawal,
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

export default Withdrawal

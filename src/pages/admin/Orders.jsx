import { Button, DatePicker, Input, Table,Radio, Flex ,Typography, Card} from 'antd';
import React, { useEffect, useState } from 'react'
import {formatDate } from '../../services/formatDate'
import { adminGet, adminPatch } from '../../services/adminApi';
import { Tag } from 'antd';
import ConfirmModal from '../../components/common/ConfirmModal';

const { RangePicker } = DatePicker;
const { Search } = Input;
const { Text } = Typography

const getStatusTag = (status) => {
  const statusColors = {
    pending: 'orange',
    stockout: "orange",

    dispute: 'blue',

    success: 'green',
    active : 'green',

    inactive : 'red',
    failed: 'red',

  };

  return <Tag className='text-xs' color={statusColors[status]}>{status.toUpperCase()}</Tag>;
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
  const [ loading,setLoading ]=useState({
    table : false,
    success : false,
    failed : false
  })

  const [modalState, setModalState] = useState({
    visible: false,
    type: '', // 'approve' or 'reject'
    data: null, // selected withdrawal object
  });

  const handleConfirm =async()=>{
    const { type, data } = modalState;
    const status = type === 'approve' ? 'success' : 'failed';
    try {
      setLoading((prev)=>({...prev,[status] : true}))
      const response = await adminPatch('/orders',{status,id : data._id})
      if(response && response.success){
        fetchOrders()
      }
    } catch (error) {
        console.log(error);
    } finally {
      setLoading((prev)=>({...prev,[status] : false}))
      setModalState({ visible: false, type: '', data: null });
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
          title: 'Order Id',
          dataIndex: 'orderId',
          key: 'orderId',
          render : (text)=> <div>{`#${text}`}</div>
        },
        {
          title: 'User',
          dataIndex: 'userId',
          key: 'userId',
          render : (text)=> <div>{`${text?.email}`}</div>
        },
        {
          title: 'Usdt',
          dataIndex: 'usdt',
          key: 'usdt',
          render : (text)=> <div>{text} USDT</div>
        },
        {
          title : "Fiat",
          dataIndex : "fiat",
          key : "fiat",
          render : (text)=> <div>{`₹${text}`}</div>
        },
        {
          title: 'Fund',
          dataIndex: 'fund',
          key: 'fund',
          render : (text,record)=> <Card bodyStyle={{padding : 4,paddingLeft : 12}} className='capitalize text-xs w-52'>
            <Flex justify='space-between' className='w-full'>
            <div className='font-semibold'>
            <div>Type: {text?.type}</div>  
              <div>Rate: ₹{text?.rate}</div>
              <div>Channel: {text?.teleChannel}</div>
            </div>
            <div>
              {text.status&&  getStatusTag(text.status)}
            </div>
            </Flex>
          </Card>,
        },
        {
          title: 'Bank Card',
          dataIndex: 'bankCard',
          key: 'bankCard',
          render : (text)=> <Card bodyStyle={{padding : 4,paddingLeft : 12}} className='capitalize text-xs font-semibold'>
            <div>Acc No: {text?.accountNumber}</div>  
            <div>IFSC: {text?.ifsc}</div>
            <div>Name: {text?.accountName}</div>
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
              <>
                 <Button
                    loading={loading.success}
                    onClick={() =>
                      setModalState({ visible: true, type: 'approve', data: render })
                    }
                    className='bg-green-500 text-white'
                  >
                    Approve
                  </Button>

                  <Button
                    loading={loading.failed}
                    onClick={() =>
                      setModalState({ visible: true, type: 'reject', data: render })
                    }
                    className='bg-red-500 text-white'
                  >
                    Reject
                  </Button>
              </> 
              }
          </div>
        },
      ];
      return columns;
    };
  const [ Orders,setOrders ]= useState([])

  const fetchOrders =async()=>{
      setLoading((prev)=>({...prev,table : true}))
      try {
        const { search, from, to, status, currentPage, pageSize } = queryObjects;
        const response = await adminGet(
          `/orders?search=${search}&from=${from}&to=${to}&status=${status}&currentPage=${currentPage}&pageSize=${pageSize}`
        )
        if(response){
          console.log(response);
          setOrders(response.orders)
          setTotalOrders(response.total || response.orders.length);
          setTotalCompletedAmount(response.totalCompletedAmount)
        }
      } catch (error) {
        console.error('Failed to fetch Orderss:', error);
      } finally {
        setLoading((prev)=>({...prev,table : false}))
      }
      
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
          <Radio.Group className='mx-1 w-full flex -z-0' onChange={handleStatusChange} defaultValue='pending'>
            <Radio.Button value=''>All</Radio.Button>
            <Radio.Button value='pending'>Pending</Radio.Button>
            <Radio.Button value='success'>Success</Radio.Button>
            <Radio.Button value='failed'>Failed</Radio.Button>
          </Radio.Group>
          <RangePicker className='h-8 mx-1 w-full sm:w-96' onChange={handleDateRange} />
          <Search
            className='mx-1 w-full sm:w-96'
            placeholder='Order Id'
            allowClear
            onSearch={handleSearch}
            // style={{ width: 300 }}
            />
        </Flex>
        <Text className='font-semibold'>Total Orders : {totalCompletedAmount}</Text>
        <div className=' w-full h-full'>
            <Table
              scroll={{ x: "max-content" }}
              loading={loading.table} 
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

        <ConfirmModal
          visible={modalState.visible}
          onConfirm={handleConfirm}
          onCancel={() => setModalState({ visible: false, type: '', data: null })}
          loading={loading[modalState.type === 'approve' ? 'success' : 'failed']}
          title={`Confirm ${modalState.type === 'approve' ? 'Approve' : 'Reject'}`}
          content={`Are you sure you want to ${modalState.type === 'approve' ? 'approve' : 'reject'} this withdrawal? This action cannot be undone.`}
        />
    </>
  )
}

export default Orders

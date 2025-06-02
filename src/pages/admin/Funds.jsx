import React, { useEffect, useState } from 'react'
import { Button, Flex, Input, Modal, Space, Table, Tag,DatePicker, Select, message } from 'antd';
import { timerIcon } from '../../assets/dashboard';
import { adminGet, adminPatch, adminPost } from '../../services/adminApi' 
import { formatDate } from '../../services/formatDate';
import AddFundDrawer from '../../components/AddFundDrawer';

const Funds = () => {
  const [fundList,setFundList]=useState([])
  const [loading,setLoading]=useState(false)
  const [queryObjects, setQueryObjects] = useState({
    search: '',
    from: '',
    to: '',
    currentPage: 1,
    pageSize: 10,
  });
  const [totalFunds, setTotalFunds] = useState(0);
  const [editingRecord, setEditingRecord] = useState(null);
  const [spin,setSpin]=useState(false)
  
  const handleStatusChange = async (newStatus, record) => {
    try {
      setSpin(true)
      const response = await adminPatch(`/fund/${record._id}/update-status`, { status: newStatus });
      if(response.success){
        message.success('Status updated');
        fetchFunds(); 
      }
    } catch (err) {
      message.error('Failed to update status');
      console.error(err);
    } finally {
      setSpin(false)  
    }
  };


  const columns = [
    {
      title: <span className='text-gray-500 font-normal'>No.</span>,
      key: 'index',
      render: (_text, _record, index) => index + 1, // Adding 1 to start from 1 instead of 0
    },
    {
      title:  <span className='text-gray-500 font-normal'>Type </span>,
      dataIndex: 'type',
      key: 'type',
      render: (text,record) => <a className='text-blue-600 cursor-pointer'>{text}</a>,
      width : 120
    },
    {
      title: <div className='flex w-32'>
        <span className='text-gray-500 font-normal mr-1 '>Join Date </span>
        <img src={timerIcon} alt="" />
      </div> ,
      key: 'createdAt',
      dataIndex: 'createdAt',
      render: (text) => <a>{text && formatDate(text)}</a>, 
    },
    {
      title:<span className='text-gray-500 font-normal'>Proccessing Amount</span>,
      dataIndex: 'rate',
      key: 'rate',
      render : (text)=> <a href="">{`$${Math.floor(text).toFixed(2)}`}</a>
    },
    {
      title:<span className='text-gray-500 font-normal'>Proccessing Amount</span>,
      dataIndex: 'paymentMode',
      key: 'paymentMode',
      render : (text)=> <div className='capitalize'>{text}</div>
    },
    {
      title: <span className='text-gray-500 font-normal'>Status</span>,
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (
        <Select
          className='border rounded-lg border-double'
          loading={spin}
          value={text} 
          style={{ width: 120 ,borderWidth : 4, borderColor : `${text === 'active' ? "green" : text === 'inactive' ? "red" : "orange"}`}}
          onChange={(value) => handleStatusChange(value, record)} 
          options={[
            { value: 'active', label: 'Active', disabled: text === 'active' },
            { value: 'inactive', label: 'Inactive', disabled: text === 'inactive' },
            { value: 'stockout', label: 'Stockout', disabled: text === 'stockout' },
          ]}
        />
      )
    },
    {
      title:<span className='text-gray-500 font-normal'>Max Fullfilment (Hr)</span>,
      dataIndex: 'maxFulfillmentTime',
      key: 'maxFulfillmentTime',
      render : (text)=> <a href="">{`${Number(text).toFixed(2)} Hours`}</a>
    },
    {
      title:  <span className='text-gray-500 font-normal'>Tele Channel </span>,
      dataIndex: 'teleChannel',
      key: 'teleChannel',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_text, record) => (
        <Button type="link" onClick={() => setEditingRecord(record)}>
          Edit
        </Button>
      ),
    }
  ];

  const fetchFunds=async()=>{
    setLoading(true)
    try {
      const response = await adminGet(`/fund`)
      if(response){
       setFundList(response.funds)
       setTotalFunds(response.funds ? response.funds.length : 0)
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchFunds()
  },[queryObjects])

  return (
    <>
    <div className='sm:p-6'>
      <Flex justify='space-between' align='center'>
      <div className='text-2xl  font-bold my-3'>Funds</div>
      <AddFundDrawer
        editingRecord={editingRecord}
        onCloseDrawer={() => setEditingRecord(null)}
        onSuccess={fetchFunds}
      />
      </Flex>
      <Table
        loading={loading}
        className='overflow-y-auto border hide-scrollbar'
        columns={columns} 
        dataSource={fundList}
        rowKey="_id"
        pagination={{
          current: queryObjects.currentPage,
          pageSize: queryObjects.pageSize,
          total: totalFunds,
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
    </>
  )
}

export default Funds

import React, { useEffect, useState } from 'react'
import { Button, Flex, Input, Modal, Space, Table, Tag,DatePicker } from 'antd';
import { timerIcon } from '../../assets/dashboard';
import { adminGet, adminPost } from '../../services/adminApi' 
import { formatDate } from '../../services/formatDate';
import { setLastRollover } from '../../redux/MasterSlice'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
const { Search } = Input;
const { RangePicker } = DatePicker;

const MyInvestments = () => {
  const [usersList,setUsersList]=useState([])
  const dispatch = useDispatch()
  const [loading,setLoading]=useState(false)
  const [changeEmail,setChangeEmail]=useState({
    show : false,
    user_id : "",
    newEmail : "",
    loading : false
  })
  const [queryObjects, setQueryObjects] = useState({
    search: '',
    from: '',
    to: '',
    currentPage: 1,
    pageSize: 10,
  });
  const [totalDeposits, setTotalDeposits] = useState(0);
  const navigate = useNavigate()
  const columns = [
    {
      title: <span className='text-gray-500 font-normal'>No.</span>,
      key: 'index',
      render: (_text, _record, index) => index + 1, // Adding 1 to start from 1 instead of 0
    },
    {
      title:  <span className='text-gray-500 font-normal'>Email </span>,
      dataIndex: 'email',
      key: 'email',
      render: (text,record) => <a className='text-blue-600 cursor-pointer' onClick={(e)=>setChangeEmail((prev)=>({...prev,show : true,user_id : record._id}))}>{text}</a>,
    },
    {
      title: <span className='text-gray-500 font-normal'>Phone</span>,
      dataIndex: 'phone',
      key: 'phone',
      render :(value,data)=>`${value}`
    },
    {
      title: <div className='flex'>
        <span className='text-gray-500 font-normal mr-1 w-32'>Join Date </span>
        <img src={timerIcon} alt="" />
      </div> ,
      key: 'createdAt',
      dataIndex: 'createdAt',
      render: (text) => <a>{formatDate(text)}</a>, 
    },
    {
      title:<span className='text-gray-500 font-normal'>Kyc Verified</span>,
      dataIndex: 'is_kyc_verified',
      key: 'is_kyc_verified',
      render : (text)=> <a href="">{`${text}`}</a>
    },
    {
      title:<span className='text-gray-500 font-normal'>Proccessing Amount</span>,
      dataIndex: 'processing',
      key: 'processing',
      render : (text)=> <a href="">{`$${Math.floor(text.rebate_wallet).toFixed(2)}`}</a>
    },
    {
      title:<span className='text-gray-500 font-normal'>Available Balance</span>,
      dataIndex: 'availableBalance',
      key: 'availableBalance',
      render : (text)=> <a href="">{`$${Math.floor(text.main_wallet).toFixed(2)}`}</a>
    },
    {
      title:<span className='text-gray-500 font-normal'>Dispute Amount</span>,
      dataIndex: 'disputeAmount',
      key: 'disputeAmount',
      render : (text)=> <a href="">{`$${Math.floor(text.main_wallet).toFixed(2)}`}</a>
    },
    {
      title:<span className='text-gray-500 font-normal'></span>,
      dataIndex: '_id',
      key: '_id',
      render : (value)=>(<Button>More details</Button>)
    },
  ];

  const fetchUsers=async()=>{
    setLoading(true)
    try {
      const response = await adminGet(
        `/users?search=${queryObjects.search}&from=${queryObjects.from}&to=${queryObjects.to}`)
      if(response){
       setUsersList(response.users)
       console.log(usersList , 'usersList')
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchUsers()
  },[queryObjects])

  const submitNewEmail=async()=>{
    setChangeEmail((prev)=>({...prev,loading : true}))
    try {    
      const response =  await adminPost('/change-email',{newEmail : changeEmail.newEmail,user_id : changeEmail.user_id})
      if(response) { 
        fetchUsers()
      }
    } catch (error) {
    
    } finally {
      setChangeEmail({ show : false,
        user_id : "",
        newEmail : "",
        loading : false
      })
    }
  }

  const handleSearch = (value) => {
    setQueryObjects((prev) => ({
      ...prev,
      search: value,
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

  return (
    <>
    <div className='sm:p-6'>
      <Flex justify='space-between' align='center'>
      <div className='text-2xl  font-bold my-3'>Users</div>
      <RangePicker className='h-8 mx-1' onChange={handleDateRange} />
      <Search
            className='mx-1'
            placeholder='email'
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            />
      <Button onClick={()=>navigate('/master/send-email')}>Send Email To User</Button>
      </Flex>
      <Table
        loading={loading}
        className='overflow-y-auto border hide-scrollbar'
        columns={columns} 
        dataSource={usersList}
        rowKey="_id"
        pagination={{
          current: queryObjects.currentPage,
          pageSize: queryObjects.pageSize,
          total: totalDeposits,
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
    <Modal title="Enter new email"  okType='default'  confirmLoading={changeEmail.loading} onOk={()=>submitNewEmail()} onCancel={()=>setChangeEmail((prev)=>({...prev,show : false,user_id : ""}))} open={changeEmail.show}>
        <Input onChange={(e)=>setChangeEmail((prev)=>({...prev,newEmail:e.target.value}))} placeholder='Email'></Input>
    </Modal>
    </>
  )
}

export default MyInvestments

import { Button, DatePicker, Flex, Radio, Table, Tag, Input, Space, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { formatDate } from '../../services/formatDate';
import { adminGet } from '../../services/adminApi';
import { useNavigate } from 'react-router-dom';

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

const Deposits = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalDepositedAmount,setTotalDepositedAmount]=useState(0)
  const navigate = useNavigate();

  const [queryObjects, setQueryObjects] = useState({
    search: '',
    from: '',
    to: '',
    status: 'approved',
    currentPage: 1,
    pageSize: 10,
  });

  const fetchAddress = async (id) => {
    setLoadingStates((prev) => ({ ...prev, [id]: true }));
    try {
      const response = await adminGet(`/fetch-address?_id=${id}`);
      if (response) {
        setModalData(response);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  const getColumns = [
    {
      title: 'No.',
      key: 'index',
      render: (_text, _record, index) =>
        (queryObjects.currentPage - 1) * queryObjects.pageSize + index + 1,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render : (text)=>formatDate(text),
      width : 120
    },
    {
      title: 'Transaction Id',
      dataIndex: 'transactionId',
      key: 'transactionId',
      render: (text) => <div>#{text}</div>,
      width : 120
    },
    {
      title: 'Payment Mode',
      dataIndex: 'paymentMode',
      key: 'paymentMode',
      render: (text) => <div>{`#${text}`}</div>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text) => <div className='text-green-600'>{`+$${text}`}</div>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Payment address',
      dataIndex: 'recieveAddress',
      key: 'recieveAddress',
      render: (_text, record) => (
       <div>
          <div>Priority: 1</div>
          <div>Address: {_text}</div>
       </div>
      ),
    },
  ];

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const { search, from, to, status, currentPage, pageSize } = queryObjects;
      const response = await adminGet(
        `/deposits?search=${search}&from=${from}&to=${to}&status=${status}&currentPage=${currentPage}&pageSize=${pageSize}`
      );
      if (response) {
        setDeposits(response.result);
        setTotalDeposits(response.total || response.result.length);
        setTotalDepositedAmount(response.totalDepositedAmount)
      }
    } catch (error) {
      console.error('Failed to fetch deposits:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeposits();
  }, [queryObjects]);

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
  

  const handleStatusChange = (e) => {
    setQueryObjects((prev) => ({
      ...prev,
      status: e.target.value.toLowerCase(),
      currentPage: 1,
    }));
  };

  console.log(queryObjects);
  
  return (
    <>
      <div className='p-2 my-2'>
          <div className=' text-lg'>Deposits History</div>
        <Flex className='flex-col sm:flex-row items-center my-2' justify='space-between'>
          <div className='flex flex-col sm:flex-row items-center w-full'>
            <Radio.Group className='mx-1 my-1 flex w-full -z-50' onChange={handleStatusChange} defaultValue='approved'>
              <Radio.Button value=''>All</Radio.Button>
              <Radio.Button value='pending'>Pending</Radio.Button>
              <Radio.Button value='approved'>Approved</Radio.Button>
              <Radio.Button value='rejected'>Rejected</Radio.Button>
            </Radio.Group>
            <RangePicker className='h-8 mx-1 w-full my-1' onChange={handleDateRange} />
            <Search
              className='mx-1 my-1 w-full sm:w-96'
              placeholder='email, txid, wallet id'
              allowClear
              onSearch={handleSearch}
              // style={{ width: 300 }}
            />
          </div>
          <Button type='primary' className='bg-blue-500 text-white my-2 w-full sm:w-44' onClick={() => navigate('/master/add-funds')}>Add Funds to user</Button>
        </Flex>
        <Text className='text-green-600 font-semibold'>Total Deposit : {totalDepositedAmount}</Text>
        <Table
          columns={getColumns}
          dataSource={deposits}
          loading={loading}
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
    </>
  );
};

export default Deposits;

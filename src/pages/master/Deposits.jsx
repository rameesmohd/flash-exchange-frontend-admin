import { Button, DatePicker, Flex, Radio, Table, Tag, Input, Space, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { formatDate } from '../../services/formatDate';
import { masterGet } from '../../services/adminApi';
import ShowAddressModel from '../../components/master/ShowAddressModel';
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
      const response = await masterGet(`/fetch-address?_id=${id}`);
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
      render: (text) => formatDate(text),
    },
    {
      title: 'Email',
      dataIndex: 'user',
      key: 'user_email',
      render: (text) => <div>{text?.email}</div>,
    },
    {
      title: 'Name',
      dataIndex: 'user',
      key: 'user_name',
      render: (text) => <div>{`${text?.first_name} ${text?.last_name}`}</div>,
    },
    {
      title: 'Txid',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
      render: (text) => <div>{`#${text}`}</div>,
    },
    {
      title: 'Wallet',
      dataIndex: 'wallet_id',
      key: 'wallet_id',
      render: (text) => <div>{`#${text}`}</div>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text) => <div>{`+$${text}`}</div>,
    },
    {
      title: 'Payment Mode',
      dataIndex: 'payment_mode',
      key: 'payment_mode',
      render: (text) => <div className='capitalize'>{text}</div>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Payment address',
      dataIndex: 'payment_address',
      key: 'payment_address',
      render: (_text, record) => (
        <Button
          key={record._id}
          loading={loadingStates[record._id] || false}
          onClick={() => fetchAddress(record._id)}
        >
          Open address
        </Button>
      ),
    },
  ];

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const { search, from, to, status, currentPage, pageSize } = queryObjects;
      const response = await masterGet(
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
        <Flex justify='space-between'>
          <div className=' text-lg'>Deposits History</div>
          <div className='flex items-center'>
            <RangePicker className='h-8 mx-1' onChange={handleDateRange} />
            <Radio.Group className='mx-1' onChange={handleStatusChange} defaultValue='approved'>
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
          <Button onClick={() => navigate('/master/add-funds')}>Add Funds to user</Button>
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

        <ShowAddressModel
          setIsModalOpen={setIsModalOpen}
          isModalOpen={isModalOpen}
          data={modalData}
        />
      </div>
    </>
  );
};

export default Deposits;

import { Table } from 'antd';
import React from 'react';
import dayjs from 'dayjs';

const Deposits = ({ investmentData }) => {
  if (!investmentData || !investmentData.deposits) return null;

  const deposits = investmentData.deposits.map((deposit) => {
    const unlockDate = dayjs(deposit.unlocked_at);
    const daysLeft = Math.max(0, unlockDate.diff(dayjs(), 'day')); // ✅ Prevent negative
  
    return {
      key: deposit._id,
      deposited_at: deposit.deposited_at,
      unlocked_at: deposit.unlocked_at,
      lock_duration: deposit.lock_duration,
      amount: deposit.amount,
      days_left: daysLeft,
    };
  });
  

  const columns = [
    {
      title: 'Deposited At',
      dataIndex: 'deposited_at',
      key: 'deposited_at',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (value) => `$${parseFloat(value).toFixed(2)}`,
    },
    {
      title: 'Unlocked At',
      dataIndex: 'unlocked_at',
      key: 'unlocked_at',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Lock Duration (days)',
      dataIndex: 'lock_duration',
      key: 'lock_duration',
    },
    {
      title: 'Days Left to Unlock',
      dataIndex: 'days_left',
      key: 'days_left',
      render: (value) => `${value} day(s)`,
    },
  ];

  return (
    <div>
      <Table columns={columns} dataSource={deposits} pagination={false} />
    </div>
  );
};

export default Deposits;

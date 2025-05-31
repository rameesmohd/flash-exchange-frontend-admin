import { Button, Tabs, Typography, Row, Col, Divider, Space } from 'antd';
const { Text, Title } = Typography;
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import  Summary from '../components/Summary'  
import User from '../components/User'
import  Offers  from '../components/Offers';
import  History  from '../components/History';
import  Positions  from '../components/Positions';
import {DollarOutlined, FilePptOutlined, MinusCircleOutlined} from '@ant-design/icons';
import Spinner from '../components/loaders/Spinner'
// import TopupWithdrawModal from '../../components/common/TopupWithdrawModal '
import { useSelector } from 'react-redux';
import Deposits from '../components/Deposits';
// import { usersGet, usersPatch, usersPost } from '../services/managerApi';

const Investment = () => {
  const location = useLocation();
  const { investment } = location.state || {}; // Fallback for safety
  const [loading,setLoading]=useState(false)
  const [investmentData,setInvestmentData]=useState(investment)
  // const {userData} = useSelector((state)=>state.User)
  
  console.log(investment);
  
  const items = [
    { 
      key: '1', 
      label: <span>Investment</span>, 
      children: <> 
       { loading ? 
        <Spinner style={'flex justify-center min-h-44'}/>
        : <Summary investmentData={investmentData}/>}
      </> 
    },
    { key: '2', 
      label: <span>Offer</span>, 
      children: <>
      { loading ? 
        <Spinner style={'flex justify-center min-h-44'}/>
        : <Offers investmentData={investmentData}/>}
      </>
    },
    { key: '3', 
      label: <span>Positions</span>, 
      children: <>
      { loading ? 
        <Spinner style={'flex justify-center min-h-44'}/>
        : <Positions investmentData={investmentData}/>}
      </>
    },
    { key: '4', 
      label: <span>Transactions</span>, 
      children: <>
      { loading ? 
        <Spinner style={'flex justify-center min-h-44'}/>
        : <History investmentData={investmentData}/>}
      </>
    },
    { key: '5', 
      label: <span>User</span>, 
      children: <>
      { loading ? 
        <Spinner style={'flex justify-center min-h-44'}/>
        : <User investmentData={investmentData}/>}
      </>
    },
    { key: '6', 
      label: <span>Deposits</span>, 
      children: <>
      { loading ? 
        <Spinner style={'flex justify-center min-h-44'}/>
        : <Deposits investmentData={investmentData}/>}
      </>
    },
  ];
  
  const [showModal,setShowModal]=useState(false)
  const [modalRole,setModalRole]=useState('')
  const [apiLoading,setApiLoading]=useState(false)
  
  // const fetchInvestment=async()=>{
  //     setApiLoading(true)
  //     const response =await usersGet(`/investment?id=${investment._id}`)
  //     if(response){
  //       console.log(response);
  //       setInvestmentData(response.result)
  //     }
  //     setApiLoading(false)
  // }

  // const handleTopup=async(amount)=>{
  //     setApiLoading(true)
  //     await usersPost('/investment',{userId : userData._id, investmentId:investmentData._id, amount})
  //     fetchInvestment()
  // }

  // const handleWithdraw=async(amount)=>{
  //   setApiLoading(true)
  //   await usersPatch('/investment',{userId : userData._id, investmentId:investmentData._id, amount})
  //   fetchInvestment()
  // }

  return (
    <div className="sm:p-2 md:p-5 pt-6 lg:p-8">
    <Row gutter={[16,0]}>
      <Col span={24}>
        <span className="text-xs text-gray-500">Investment #{investmentData._id}</span>
        <div className="text-3xl">{investmentData?.manager_nickname}</div>
      </Col>

      <Col span={24}>
        <div className="shadow-md border-t-0 p-3">
          <Tabs className="custom-tabs" defaultActiveKey="1" items={items} />
        </div>
      </Col>
    </Row>
  </div>
  )
}

export default Investment

import React, { useEffect, useState } from 'react'
import InfoRow from './InfoRow';
import './styles/collapseAntd.css'
import { managerGet } from '../services/managerApi';

const App = ({investmentData}) => {
  const [userData,setUserData]=useState({})

  const fetchUser=async()=>{
      const response = await managerGet(`/user?_id=${investmentData.user._id}`)
      if(response){
          console.log(response);
          setUserData(response.result)
      }
  }

  useEffect(()=>{
    if(investmentData.user && investmentData.user._id){
      fetchUser()
    }
  },[])

  const {
    user_id = '',
    first_name = '',
    last_name = '',
    email = '',
    updatedAt='',
    createdAt='',
    is_kyc_verified = '',
    country = ''
  }=userData

  const data = [
    { label: 'Name', value: `${first_name+" "+last_name}` },
    { label: 'Email', value: email,className : "lowercase"},
    { label: 'User Id', value: user_id },
    { label: 'Signup date', value: createdAt},
    { label: 'KYC verified', value: `${is_kyc_verified}` },
    { label: 'Country', value: country },
    { label: 'Last Updated At', value: updatedAt },
  ];

  return (
    <div className='text-gray-500 sm:px-2 md:px-4 lg:px-6'>
      <div>
      {data.map((item, index) => (
          <InfoRow className={item?.className} key={index} label={item.label} value={item.value} />
      ))}
    </div>
    </div>
  )
}

export default App



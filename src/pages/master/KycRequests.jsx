import React, { useEffect, useState } from 'react'
import { Button, Space, Table, Tag } from 'antd';
import { timerIcon } from '../../assets/dashboard';
import { masterGet, masterPatch, masterPost } from '../../services/masterApi' 
import { formatDate } from '../../services/formatDate';
import ShowImageModal from '../../components/master/ShowImageModal'


const getStatusTag = (status) => {
  const statusColors = {
    submitted: 'orange',
    verified: 'green',
    unavailable: 'red',
  };

  return <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>;
};

const getBooleanTag = (status)=>{
    const statusColors = {
        true: 'green',
        false: 'red',
      };
    
      return <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>;
}



const KycRequests = () => {
  const [ usersList,setUsersList]=useState([])
  const [ isModalOpen, setIsModalOpen] = useState(false);
  const [ modal,setModal]=useState({
    role : "",
    record : {}
  })
  const [loading,setLoading]=useState({
    table : false,
    modal : false,
    approve : false
  })

  const handleModal=({role,record})=>{
    setModal({
        role,
        record
    })
    setIsModalOpen(true)
  }

  const columns = [
      {
          title: <span className='text-gray-500 font-normal'>#</span>,
          key: 'index',
          render: (_text, _record, index) => index + 1, // Adding 1 to start from 1 instead of 0
      },
      {
          title: <span className='text-gray-500 font-normal'>User#</span>,
          dataIndex : "user_id",
          key: 'user_id',
      },
      {
          title:  <span className='text-gray-500 font-normal'>Email </span>,
          dataIndex: 'email',
          key: 'email',
          render: (text) => <a>{text}</a>,
      },
      {
          title: <span className='text-gray-500 font-normal'>Name</span>,
          dataIndex: 'first_name',
          key: 'first_name',
          render:(text,data)=>text+" "+data.last_name
      },
      {
          title: <span className='text-gray-500 font-normal'>Country</span>,
          key: 'country',
          dataIndex: 'country'
      },
      {
          title: <div className='flex'>
          <span className='text-gray-500 font-normal mr-1'>Join Date </span>
          <img src={timerIcon} alt="" />
          </div> ,
          key: 'createdAt',
          dataIndex: 'createdAt',
          render: (text) => <a>{formatDate(text)}</a>, 
      },
      {
          title:<span className='text-gray-500 font-normal'>Email Verified</span>,
          dataIndex: 'is_email_verified',
          key: 'is_email_verified',
          render : (text)=> <div href="">{getBooleanTag(`${text}`)}</div>
      },
      {
          title:<span className='text-gray-500 font-normal'>Id Status</span>,
          dataIndex: 'identify_proof_status',
          key: 'identify_proof_status',
          render : (text)=> getStatusTag(text)
      },
      {
          title:<span className='text-gray-500 font-normal'>Identity Proof</span>,
          dataIndex: 'identify_proof',
          key: 'identify_proof',
          render : (text,record)=> <Button onClick={()=>handleModal({role : "identify_proof",record})}>Open</Button>
      },
      {
          title:<span className='text-gray-500 font-normal'>Residential Proof Status</span>,
          dataIndex: 'residential_proof_status',
          key: 'residential_proof_status',
          render : (text)=>getStatusTag(text)
      },
      {
          title:<span className='text-gray-500 font-normal'>Residential Proof</span>,
        dataIndex: 'residential_proof',
        key: 'residential_proof',
        render : (text,record)=> <Button onClick={()=>handleModal({role : "residential_proof",record})}>Open</Button>
      },
      {
          title:<span className='text-gray-500 font-normal'>Kyc Verified</span>,
          dataIndex: 'is_kyc_verified',
          key: 'is_kyc_verified',
          render : (text)=> getBooleanTag(`${text}`)
      },
      {
          title:<span className='text-gray-500 font-normal'></span>,
          key: '_id',
          render : (text,render)=> <Button 
          onClick={()=>approveKyc({_id:render._id})} 
          disabled={render?.residential_proof_status!='verified' || render?.identify_proof_status!='verified'}> Approve </Button>
      }
  ];

  const handleModalSubmit=async(status)=>{
    setLoading((prev)=>({...prev,modal : true}))
    try {
        const response =  await masterPatch('/kyc-requests',{role : modal.role ,record_id : modal.record._id ,status})
        if(response){
            console.log(response);
            fetchUsers()
        }
    } catch (error) {
        console.log(error);
    } finally { 
        setLoading((prev)=>({...prev,modal : false}))
    }
  }

  const fetchUsers=async()=>{
    try {
        const response = await masterGet('/kyc-requests')
        if(response){
         setUsersList(response.result)
         console.log(usersList , 'usersList')
        }
    } catch (error) {
        console.log(error);
    }
  }

  const approveKyc=async({_id})=>{
    try {
      const response = await masterPost('/kyc-requests',{_id})
      if(response){
        fetchUsers()
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(()=>{
    fetchUsers()
  },[])

  return (
    <>
    <div className='sm:p-6'>
      <div className='text-2xl  font-bold my-3'>Kyc Requests</div>
      <Table
        className='overflow-y-auto border hide-scrollbar'
        columns={columns} 
        dataSource={usersList}
      />
    </div>
    <ShowImageModal 
        role={modal.role} 
        record={modal.record} 
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen} 
        onSubmit={handleModalSubmit}
    />
    </>
  )
}

export default KycRequests

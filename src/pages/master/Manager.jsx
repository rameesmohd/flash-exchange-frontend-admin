import { Button, Divider } from 'antd'
import React, { useEffect, useState } from 'react'
import AddDrawer from '../../components/master/AddDrawer'
import {masterGet, masterPatch, masterPost} from '../../services/adminApi'

const Providers = () => {
  const [showDrawer,setShowDrawer]=useState({
    show : false,
    role : 'add',
    loading : false
  })
  console.log(showDrawer);
  const [ formData,setFormData]=useState({})
  const [ providers,setProviders]=useState([])

  const fetchProvisers =async()=>{
     const response = await masterGet('/manager')
     if(response && response.result){
      setProviders(response.result)
     }
  }
  const handleSubmit = async(values) => {
    setShowDrawer((prev)=>({...prev, loading : true}))
    setFormData(values); 
    console.log('Form Data:', values);
    await masterPost('/manager',values)
    fetchProvisers()
    setShowDrawer((prev)=>({...prev, loading : false}))
  };

  const handleUpdate=async(values)=>{
    setShowDrawer((prev)=>({...prev, loading : true}))
    setFormData(values); 
    await masterPatch('/manager',values)
    fetchProvisers()
    setShowDrawer((prev)=>({...prev, loading : false}))
  }


  const handleEdit=(provider)=>{
        setFormData(provider)
        setShowDrawer((prev)=>({...prev, show : true , role : 'edit' }))
  }

  useEffect(()=>{
    fetchProvisers()
  },[])

  return (
    <>
    <div className='sm:p-4'>
        <div className='w-full flex sm:px-8 items-center justify-between'>
              <div className='text-2xl  font-bold my-3'>Providers</div>
              <Button onClick={()=>setShowDrawer((prev)=>({...prev, show : true , role : 'add' }))}>Add Provider</Button>
        </div>
        <hr />
        <div>
            <div className='w-full '>
            {
              providers.map((provider, idx) => (
              <div key={idx} className="p-6 border border-gray-300 my-2 bg-gray-50  grid w-full sm:grid-cols-2 ">
                {Object.entries(provider).map(([key, value], i) => {
                  // Skip rendering password
                  if (key === 'password') return null;

                  // Truncate description to a few words (e.g., 10 words)
                  const truncatedValue =
                  (key === 'description')
                  ? `${value.split(' ').slice(0, 4).join(' ')}...`
                  : (key === 'img_url')
                    ? value.length > 30 ? `${value.slice(0, 30)}...` : value
                    : value;

                  return (
                    <div key={i}>
                      <strong>{key}</strong>: {truncatedValue}
                      <Divider className='my-1'/>
                    </div>
                  );
                })}
                <div>
                  <Button onClick={()=>handleEdit(provider)} className='w-1/3'>Edit</Button>
                </div>
              </div>
            ))}
            </div>
        </div>
    </div>
    {showDrawer.show && showDrawer.role=='add' && 
    <AddDrawer 
      role={showDrawer.role} 
      open={showDrawer.show} 
      setOpen={setShowDrawer}
      formData={{}} 
      loading={showDrawer.loading}
      submitHandler={handleSubmit} 
    />}
    {showDrawer.show && showDrawer.role=='edit' && 
    <AddDrawer 
      role={showDrawer.role} 
      open={showDrawer.show} 
      setOpen={setShowDrawer}
      formData={formData} 
      loading={showDrawer.loading}
      submitHandler={handleUpdate} 
    />}
    </>
  )
}

export default Providers

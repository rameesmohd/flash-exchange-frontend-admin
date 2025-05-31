import React from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import Button from './Button'

const LoginForm = ({title,inputs,links,handleSubmit,loading}) => {
  const navigate = useNavigate()
  return (
    <>
        <div className='border rounded-lg  flex justify-center p-6 sm:w-1/3'>
        <div className='w-full'>
              <div className=' text-center my-4'>
                <div className='flex justify-center'>
                  <img src={logo} alt="" />
                </div>
                <div className='text-2xl my-2'>{title}</div>
                <div className='text-xs'>Login to Dashboard</div>
              </div>
              { 
                inputs.map((val,idx)=><React.Fragment key={idx}>{val}</React.Fragment>) 
              }
              <div className='flex justify-center'>
              <Button 
                style={'border py-2 rounded-md text-white font-light px-8 bg-blue-500'}
                text={"Login"}
                onclick={handleSubmit}
                loading={loading}
                />
              </div>
              <div className='flex justify-between'>
                <div onClick={()=>links.handleClick()} className='my-4 text-left px-1 text-sm text-gray-500 cursor-pointer font-light'>{links.text}</div>
                <div onClick={()=>navigate(-1)} className='my-4 text-right px-1 text-sm text-gray-500 cursor-pointer font-light'>Back</div>
              </div>
        </div>
        </div>
    </>
  )
}

export default LoginForm

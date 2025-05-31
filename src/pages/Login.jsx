import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import {Button, Typography } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { adminPost } from '../services/adminApi'
import { setToken } from '../redux/MasterSlice'
  
const InputField = ({
  lowerLabel,
  className , 
  label, 
  name, 
  type = "text", 
  value, 
  handleChange, 
  error, 
  placeholder 
}) => {
  return (
    <div className="mb-4">
      <label className="text-sm  font-semibold text-gray-500 ">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        className={className&&className.input ? className.input : "w-full border custom-input border-gray-200 rounded px-3 py-2"}
        placeholder={placeholder}
      />
    {error && <p className="text-red-500 text-sm">{error}</p>}
    {!error && lowerLabel}
  </div>
  )
}


const LoginForm = ({role}) => {
    const navigate = useNavigate()
    const [ formData,setFormData]=useState({id: "",password : ""})
    const [errors, setErrors] = useState({}); 
    const [loading,setLoading]=useState(false)
    const dispatch = useDispatch()
    const { token  } = useSelector((state)=>state.Manager)
    const { masterToken  } = useSelector((state)=>state.Master)


    const handleChange = (e) =>{
        const { name , value }= e.target
        setFormData((prev)=>({...prev,[name]:value}))
        setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    const followeInputFields=[
        <InputField
            placeholder={'Id'}
            name={"id"}
            handleChange={handleChange}
            value={formData.id}
            className={{
            input : "w-full border custom-input border-gray-200 rounded px-3",
            }}
            lowerLabel={<span className='text-sm text-gray-400'>Manager Id*</span>}
            error={errors.id}
        />,
        <InputField
              placeholder={'Password'}
              name={"password"}
              handleChange={handleChange}
              value={formData.password}
              className={{
                input : "w-full border custom-input border-gray-200 rounded px-3",
              }}
              lowerLabel={<span className='text-sm  text-gray-400'>Password*</span>}
              error={errors.password}
        />
      ]

      const validate = () => {
        let validationErrors = {};
    
        // Follower & Provider validation rules
        if (!formData.id) {
            validationErrors.id = 'id is required.';
        } 
        if (!formData.password) {
          validationErrors.password = 'Password is required.';
        } else if (formData.password.length < 8) {
          validationErrors.password = 'Password must be at least 8 characters long.';
        }
    
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0; // Valid if no errors
      };

      const handleSubmit =async (e) => {
        e.preventDefault();
        console.log('Form Data:', formData);
        if (validate()) {
          navigate('/dashboard')
        }
      };

      useEffect(()=>{
        if(token){
        }
      },[token])

  return (
    <>
    <div className='w-full h-screen flex justify-center items-center'>
        <div className='border rounded-lg flex justify-center p-6 lg:w-1/4'>
        <div className='w-full'>
              <div className=' text-center my-4'>
                <div className='flex justify-center'>
                  <img src={logo} alt="" />
                </div>
                <div className='text-2xl my-2 capitalize'>Admin Login</div>
                <div className='text-xs'>Login to Dashboard</div>
              </div>
              { 
                followeInputFields.map((val,idx)=><React.Fragment key={idx}>{val}</React.Fragment>) 
              }
              <div className='flex justify-center'>
              <Button 
                type='default'
                text="Login"
                onClick={handleSubmit}
                loading={loading}
              >Login</Button>
              </div>
              <div className='text-center'>
              </div>
        </div>
        </div>
    </div>
    </>
  )
}

export default LoginForm

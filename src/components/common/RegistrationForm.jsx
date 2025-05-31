import React, { useEffect, useState } from "react";
import InputField from "./InputField";
import SelectField from "./SelectField";
import CountryCodeSelect from './CountryCodeSelect'
import CountrySelect from './CountrySelect'
import { Spin } from "antd";

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  country: "",
  countryCode: "+1201", 
  mobile: "",
  dateOfBirth: "",
  accountType: "",
  platform: "",
  leverage: "",
  password: "",
  confirmPassword: "",
};

const RegisterForm = ({loading,role,submitRegister}) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName) newErrors.firstName = "First name is required.";
    if (!formData.lastName) newErrors.lastName = "Last name is required.";
    if (!formData.email.includes("@")) newErrors.email = "Invalid email.";
    if (!formData.country) newErrors.country = "Country is required.";
    if (!/^\d{10,15}$/.test(formData.mobile))
      newErrors.mobile = "Invalid mobile number.";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required.";
    if (formData.password.length < 8)
        newErrors.password = "Password must be at least 8 characters.";
    if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match.";
    if (role === "Strategy Provider") {      
      if (!formData.accountType) newErrors.accountType = "Account type is required.";
      if (!formData.platform) newErrors.platform = "Platform is required.";
      if (!formData.leverage) newErrors.leverage = "Leverage is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(validate());
    
    if (validate()) {
      submitRegister(formData)
      console.log(formData);
      // setFormData(initialState); 
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch("https://restcountries.com/v3.1/all");
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };
  
  useEffect(()=>{
    fetchCountries()
  },[])

  return (
    <div className="flex justify-center  items-center">
      <form onSubmit={handleSubmit} className="sm:w-1/3 w-full px-2 sm:px-6 bg-white rounded shadow">
        {/** First Name */}
        <InputField 
           label="First Name"
           name="firstName"
           value={formData.firstName}
           handleChange={handleChange}
           error={errors.firstName}
            placeholder='John'
        />
        <InputField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          handleChange={handleChange}
          error={errors.lastName}
          placeholder='Wick'
        />
        <InputField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          handleChange={handleChange}
          error={errors.email}
          placeholder='wick@provider.com'
        />
        <CountrySelect
          label="Country of Residence"
          name="country"
          options={countries}
          value={formData.country}
          handleChange={handleChange}
          error={errors.country}
        />

        {/** Mobile */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-500">Mobile</label>
          <div className="flex items-center space-x-2">
          <div className=" mr-2">
            <CountryCodeSelect value={formData.countryCode} handleChange={handleChange} />
          </div>
          <input
            name="mobile"
            type="text"
            value={formData.mobile}
            onChange={handleChange}
            className="w-full border border-gray-200  rounded px-3 py-2"
            placeholder="xxxxxxxxxx"
          />
          </div>
          {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}
        </div>

        {/** Date of Birth */}
        <InputField
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          handleChange={handleChange}
          error={errors.dateOfBirth}
        />

        {role === "Strategy Provider" && (
          <>
            <SelectField 
              label="Account Type" name="accountType" 
              options={[{ value: "personal", label: "Personal" }, { value: "business", label: "Business" }]} 
              value={formData.accountType} handleChange={handleChange} error={errors.accountType}
            />
            <SelectField 
              label="Platform" name="platform" 
              options={[{ value: "Metatrader 4", label: "Metatrader 4" }, { value: "Metatrader 5", label: "Metatrader 5" }]} 
              value={formData.platform} handleChange={handleChange} error={errors.platform}
            />
            <SelectField 
              label="Leverage" name="leverage" 
              options={[{ value: "1:50", label: "1:50" }, { value: "1:100", label: "1:100" }, { value: "1:200", label: "1:200" }, { value: "1:500", label: "1:500" }]} 
              value={formData.leverage} handleChange={handleChange} error={errors.leverage}
            />
          </>
        )}

        {/** Password */}
        <InputField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          handleChange={handleChange}
          error={errors.password}
        />

        {/** Confirm Password */}
          <InputField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          handleChange={handleChange}
          error={errors.confirmPassword}
        />

        <div className="my-4 text-sm">
          <div className="font-semibold">By clicking "Register", you agree to the below:</div>
          <div>
          I declare that I have read, fully understood and hereby accept the entire text of the: <span className="text-blue-500 font-semibold">Terms and Conditions</span>
          </div>
        </div>
          
        {/** Submit Button */}
        <button disabled={loading} type="submit" className="w-full bg-blue-500 cursor-pointer text-white py-2 rounded">
         { loading ? 
         <Spin
            indicator={
            <span
              style={{
                width: '24px',
                height: '24px',
                display: 'inline-block',
                border: '3px solid #ffffff',
                borderRadius: '50%',
                borderTopColor: 'transparent',
                animation: 'spin 1s linear infinite',
              }}
          />
        }
        /> :  'Register'}
        </button>

        <div className="my-6 text-xs font-light text-center">All trading involves risk. It is possible to lose all your capital.</div>
      </form>
    </div>
  );
};

export default RegisterForm;

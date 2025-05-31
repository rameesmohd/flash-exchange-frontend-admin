  import React from 'react'
  
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
  
  export default InputField
  
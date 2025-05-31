import React from 'react'

const SelectField = ({ label, name, options, value, handleChange, error }) => {
  return (
    <div className="mb-4">
    <label className="text-sm font-semibold text-gray-500">{label}</label>
    <select
      name={name}
      value={value}
      onChange={handleChange}
      className="w-full border border-gray-200 rounded px-3 py-2"
    >
      <option value="">Select an option</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
  )
}

export default SelectField
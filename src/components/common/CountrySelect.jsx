import React from 'react'

const CountrySelect = ({ label, name, options, value, handleChange, error }) => {
  return (
    <div className="mb-4">
        <label className="text-sm font-semibold text-gray-500">{label}</label>
        <select
        name={name}
        value={value}
        onChange={handleChange}
        className="w-full border border-gray-200 rounded px-3 py-2"
        >
        <option value="">Select a country</option>
        {options.map((country) => (
            <option key={country.cca2} value={country.name.common}>
            {country.name.common}
            </option>
        ))}
        </select>
        {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}

export default CountrySelect

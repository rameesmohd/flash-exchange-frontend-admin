import React, { useEffect, useState } from 'react'

const CountryCodeSelect = ({ value, handleChange }) => {
    const [countryCodes, setCountryCodes] = useState([]);
  
    useEffect(() => {
      const fetchCountryCodes = async () => {
        try {
          const response = await fetch("https://restcountries.com/v3.1/all");
          const data = await response.json();
          const codes = data
            .map((country) => ({
              name: country.name.common,
              code: country.idd.root
                ? country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : "")
                : "N/A",
            }))
            .filter((c) => c.code !== "N/A"); // Filter out countries with no codes
          setCountryCodes(codes);
        } catch (error) {
          console.error("Failed to fetch country codes:", error);
        }
      };
      fetchCountryCodes();
    }, []);
  
    return (
      <select
        name="countryCode"
        value={value}
        onChange={handleChange}
        className="border w-full border-gray-300 rounded px-3 py-2"
      >
        <option value="">Select Country Code</option>
        {countryCodes.map((country,i) => (
          <option  key={`${i+country.code}`} value={country.code}>
            {country.name} ({country.code})
          </option>
        ))}
      </select>
    );
}

export default CountryCodeSelect
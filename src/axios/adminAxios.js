import axios from 'axios'
// import { useSelector } from 'react-redux'
const master = import.meta.env.VITE_MASTER_API_URL

const masterAxios=()=>{
  const token = ""
  // useSelector((store)=>store.User.token)
  const masterAxiosInstance = axios.create({
      baseURL: master
  })
  
  masterAxiosInstance.interceptors.request.use((config)=>{
      if(token) {
          config.headers["Authorization"]=`Bearer ${token}`;
      }
      return config
  },(error)=>{
      return Promise.reject(error)
  })

  return masterAxiosInstance
}

export default masterAxios;
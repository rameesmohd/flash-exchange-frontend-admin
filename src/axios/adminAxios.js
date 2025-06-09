import axios from 'axios'
const master = import.meta.env.VITE_MASTER_API_URL

const masterAxios=()=>{
  const masterAxiosInstance = axios.create({
    baseURL: master,
    withCredentials: true
  })
  return masterAxiosInstance
}

export default masterAxios;
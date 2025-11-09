import a from 'axios'
const axios = a.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.rwaka.rw/api/v1',
  withCredentials: true
})

export default axios

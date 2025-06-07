import a from 'axios'
import { getAuthToken } from './utils'
const token = getAuthToken()
const axios = a.create({
  baseURL: `https://ask.rwaka.rw/api/proxy`,
  withCredentials: true,
  headers: token ? { Authorization: `Bearer ${token}` } : {}
})

export default axios

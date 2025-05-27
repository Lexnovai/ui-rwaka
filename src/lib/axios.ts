import a from 'axios'
import { getBaseUrl } from './getBaseUrl'
import { getAuthToken } from './utils'
const token = getAuthToken()
const axios = a.create({
  baseURL: `${getBaseUrl()}/api/proxy`,
  withCredentials: true,
  headers: token ? { Authorization: `Bearer ${token}` } : {}
})

export default axios

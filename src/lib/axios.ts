import a from 'axios'
import { getBaseUrl } from './getBaseUrl'

const axios = a.create({
  baseURL: `${getBaseUrl()}/api/proxy`,
  withCredentials: true
})

export default axios

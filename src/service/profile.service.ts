import { ApiResponse, UserProfile } from '@/interface/profile'
import axios from 'axios'

export const getProfile = async (): Promise<ApiResponse<UserProfile>> => {
  const response = await axios.get('/api/auth/users/profile')
  return response.data
}

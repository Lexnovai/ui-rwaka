import { ApiResponse, UserProfile } from '@/interface/profile'
import axios from '@/lib/axios'

export const getProfile = async (): Promise<ApiResponse<UserProfile>> => {
  const response = await axios.get('/users/profile')
  return response.data
}

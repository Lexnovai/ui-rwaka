import {
  ApiResponse,
  ChangePasswordDto,
  UserProfile
} from '@/interface/profile'
import axios from '@/lib/axios'

export const getProfile = async (): Promise<ApiResponse<UserProfile>> => {
  const response = await axios.get('/users/profile')
  return response.data
}
export const logout = async (): Promise<ApiResponse<void>> => {
  const response = await axios.post('/auth/logout', null, {
    withCredentials: true
  })

  return response.data
}
export const changePassword = async (
  id: string,
  payload: ChangePasswordDto
): Promise<ApiResponse<void>> => {
  const response = await axios.patch(`/auth/change-password/${id}`, payload, {
    withCredentials: true
  })

  return response.data
}

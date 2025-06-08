export interface UserProfile {
  id: string
  name: string
  email?: string
  avatar?: string
  role?: string
  location?: string
  phone?: string
  bio?: string
  instructions?: string
}
export interface ApiResponse<T = void> {
  message: string
  payload: T
}
export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
}
export interface ApiResponse<T = void> {
  message: string
  payload: T
}
export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

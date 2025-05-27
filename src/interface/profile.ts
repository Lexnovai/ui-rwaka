export interface UserProfile {
  id: string
  name: string
  email: string
}
export interface ApiResponse<T = void> {
  message: string
  payload: T
}

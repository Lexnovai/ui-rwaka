import { toast } from 'sonner'

import { APIRoutes } from './routes'

import { Agent, ComboboxAgent, SessionEntry } from '@/types/playground'
import { getAuthToken } from '@/lib/utils'

export const getPlaygroundAgentsAPI = async (
  endpoint: string
): Promise<ComboboxAgent[]> => {
  const url = APIRoutes.GetPlaygroundAgents(endpoint)
  const token = getAuthToken()

  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })

    if (!response.ok) {
      console.error('Error response:', response.status, response.statusText)
      toast.error(`Failed to fetch playground agents: ${response.statusText}`)
      return []
    }

    const data = await response.json()

    if (!Array.isArray(data.payload)) {
      console.error('Expected array at data.payload but got:', data)
      toast.error('Unexpected response format for agents.')
      return []
    }

    const agents: ComboboxAgent[] = data.payload.map((item: Agent) => ({
      value: item.agent_id || '',
      label: item.name || '',
      model: item.model || '',
      storage: item.storage || false
    }))

    return agents
  } catch (err) {
    console.error('Fetch failed:', err)
    toast.error('Error fetching playground agents')
    return []
  }
}

export const getPlaygroundStatusAPI = async (base: string): Promise<number> => {
  const token = getAuthToken()
  const response = await fetch(APIRoutes.PlaygroundStatus(base), {
    method: 'GET',
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
  return response.status
}

export const getAllPlaygroundSessionsAPI = async (
  base: string,
  agentId: string
): Promise<SessionEntry[]> => {
  const token = getAuthToken()
  try {
    const response = await fetch(
      APIRoutes.GetPlaygroundSessions(base, agentId),
      {
        method: 'GET',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    )

    if (!response.ok) {
      console.error(
        'Failed to fetch sessions:',
        response.status,
        response.statusText
      )

      if (response.status === 404) {
        return []
      }

      toast.error(`Failed to fetch sessions: ${response.statusText}`)
      return []
    }

    const json = await response.json()
    console.log('Fetched sessions:', json)
    return json
  } catch (err) {
    console.error('Fetch error in getAllPlaygroundSessionsAPI:', err)
    toast.error('Network error while fetching sessions.')
    return []
  }
}

export const getPlaygroundSessionAPI = async (
  base: string,
  agentId: string,
  sessionId: string
) => {
  const token = getAuthToken()
  try {
    const response = await fetch(
      APIRoutes.GetPlaygroundSession(base, agentId, sessionId),
      {
        method: 'GET',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    )

    if (!response.ok) {
      console.error(
        'Failed to fetch session:',
        response.status,
        response.statusText
      )

      if (response.status === 404) {
        return []
      }

      toast.error(`Failed to fetch session: ${response.statusText}`)
      return []
    }

    const json = await response.json()
    console.log('Fetched session:', json)
    return json
  } catch (err) {
    console.error('Fetch error in getPlaygroundSessionAPI:', err)
    toast.error('Network error while fetching session.')
    return []
  }
}

export const deletePlaygroundSessionAPI = async (
  base: string,
  agentId: string,
  sessionId: string
) => {
  const token = getAuthToken()
  const response = await fetch(
    APIRoutes.DeletePlaygroundSession(base, agentId, sessionId),
    {
      method: 'DELETE',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }
  )
  return response
}

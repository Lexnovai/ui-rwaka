import { toast } from 'sonner'
import { APIRoutes } from './routes'

import {
  Agent,
  ComboboxAgent,
  GetSessionsResponse,
  SessionEntry,
  SessionResponse
} from '@/types/playground'

export const getPlaygroundAgentsAPI = async (
  endpoint: string
): Promise<ComboboxAgent[]> => {
  const url = APIRoutes.GetPlaygroundAgents(endpoint)

  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include'
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
  const response = await fetch(APIRoutes.PlaygroundStatus(base), {
    method: 'GET',
    credentials: 'include'
  })
  return response.status
}

export const getAllPlaygroundSessionsAPI = async (
  base: string,
  agentId: string
): Promise<SessionEntry[]> => {
  try {
    const response = await fetch(
      APIRoutes.GetPlaygroundSessions(base, agentId),
      {
        method: 'GET',
        credentials: 'include'
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

    const json: GetSessionsResponse = await response.json()
    return json.payload ?? []
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
): Promise<SessionResponse | null> => {
  try {
    const response = await fetch(
      APIRoutes.GetPlaygroundSession(base, agentId, sessionId),
      {
        method: 'GET',
        credentials: 'include'
      }
    )

    if (!response.ok) {
      console.error(
        'Failed to fetch session:',
        response.status,
        response.statusText
      )

      if (response.status === 404) {
        return null
      }

      toast.error(`Failed to fetch session: ${response.statusText}`)
      return null
    }

    const json = await response.json()
    return json.payload ?? null
  } catch (err) {
    console.error('Fetch error in getPlaygroundSessionAPI:', err)
    toast.error('Network error while fetching session.')
    return null
  }
}

export const deletePlaygroundSessionAPI = async (
  base: string,
  agentId: string,
  sessionId: string
) => {
  const response = await fetch(
    APIRoutes.DeletePlaygroundSession(base, agentId, sessionId),
    {
      method: 'DELETE',
      credentials: 'include'
    }
  )
  return response
}

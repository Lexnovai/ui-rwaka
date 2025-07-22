import { toast } from 'sonner'
import { APIRoutes } from './routes'
import { Agent, ComboboxAgent, SessionEntry } from '@/types/playground'
import apiFetch from './apiFetch'

export const getPlaygroundAgentsAPI = async (
  endpoint: string
): Promise<ComboboxAgent[]> => {
  const url = APIRoutes.GetPlaygroundAgents(endpoint)
  try {
    const response = await apiFetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      toast.error(`Failed to fetch playground agents: ${response.statusText}`)
      return []
    }
    const data = await response.json()
    const agents: ComboboxAgent[] = data.map((item: Agent) => ({
      value: item.agent_id || '',
      label: item.name || '',
      model: item.model || '',
      storage: item.storage || false
    }))
    return agents
  } catch {
    toast.error('Error fetching playground agents')
    return []
  }
}

export const getPlaygroundStatusAPI = async (base: string): Promise<number> => {
  const response = await apiFetch(APIRoutes.PlaygroundStatus(base), {
    method: 'GET',
    credentials: 'include'
  })
  return response.status
}

export const getAllPlaygroundSessionsAPI = async (
  base: string,
  agentId: string,
  userId: string
): Promise<SessionEntry[]> => {
  try {
    const response = await apiFetch(
      APIRoutes.GetPlaygroundSessions(base, agentId, userId),
      {
        method: 'GET',
        credentials: 'include'
      }
    )
    if (!response.ok) {
      if (response.status === 404) {
        return []
      }
      throw new Error(`Failed to fetch sessions: ${response.statusText}`)
    }
    return response.json()
  } catch {
    return []
  }
}

export const getPlaygroundSessionAPI = async (
  base: string,
  agentId: string,
  sessionId: string,
  userId: string
) => {
  const response = await apiFetch(
    APIRoutes.GetPlaygroundSession(base, agentId, sessionId, userId),
    {
      method: 'GET',
      credentials: 'include'
    }
  )
  return response.json()
}

export const deletePlaygroundSessionAPI = async (
  base: string,
  agentId: string,
  sessionId: string,
  userId: string
) => {
  const response = await apiFetch(
    APIRoutes.DeletePlaygroundSession(base, agentId, sessionId, userId),
    {
      method: 'DELETE',
      credentials: 'include'
    }
  )
  return response
}

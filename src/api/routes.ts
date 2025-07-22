export const APIRoutes = {
  GetPlaygroundAgents: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/agents`,
  AgentRun: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/agents/{agent_id}/runs`,
  PlaygroundStatus: (PlaygroundApiUrl: string) => `${PlaygroundApiUrl}/status`,
  GetPlaygroundSessions: (
    PlaygroundApiUrl: string,
    agentId: string,
    userId: string
  ) => `${PlaygroundApiUrl}/agents/${agentId}/sessions?user_id=${userId}`,
  GetPlaygroundSession: (
    PlaygroundApiUrl: string,
    agentId: string,
    sessionId: string,
    userId: string
  ) =>
    `${PlaygroundApiUrl}/agents/${agentId}/sessions/${sessionId}?user_id=${userId}`,
  DeletePlaygroundSession: (
    PlaygroundApiUrl: string,
    agentId: string,
    sessionId: string,
    userId: string
  ) =>
    `${PlaygroundApiUrl}/agents/${agentId}/sessions/${sessionId}?user_id=${userId}`
}

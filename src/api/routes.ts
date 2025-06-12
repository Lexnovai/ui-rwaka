export const APIRoutes = {
  GetPlaygroundAgents: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/agents`,
  AgentRun: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/agents/{agent_id}`,
  PlaygroundStatus: (PlaygroundApiUrl: string) => `${PlaygroundApiUrl}/status`,
  GetPlaygroundSessions: (PlaygroundApiUrl: string, agentId: string) =>
    `${PlaygroundApiUrl}/agents/${agentId}/sessions`,
  GetPlaygroundSession: (
    PlaygroundApiUrl: string,
    agentId: string,
    sessionId: string
  ) => `${PlaygroundApiUrl}/agents/${agentId}/sessions/${sessionId}`,

  DeletePlaygroundSession: (
    PlaygroundApiUrl: string,
    agentId: string,
    sessionId: string
  ) => `${PlaygroundApiUrl}/agents/${agentId}/sessions/${sessionId}`
}

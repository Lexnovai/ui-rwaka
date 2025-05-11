import React from 'react'
import { usePlaygroundStore } from '@/store'
import { useQueryState } from 'nuqs'
import Link from 'next/link'
import Icon from '@/components/ui/icon'


const SessionBlankState = () => {
  const { selectedEndpoint, isEndpointActive, hasStorage } =
    usePlaygroundStore()
  const [agentId] = useQueryState('agent')

  const errorMessage = (() => {
    switch (true) {
      case !isEndpointActive:
        return 'Endpoint is not connected. Please connect the endpoint to see the history.'
      case !selectedEndpoint:
        return 'Select an endpoint to see the history.'
      case !agentId:
        return 'Select an agent to see the history.'
      case !hasStorage:
        return (
          <>
            Connect{' '}
            <Link
              className="underline"
              href={'https://docs.agno.com/storage'}
              target="_blank"
            >
              storage
            </Link>{' '}
            to your agent to see sessions.{' '}
          </>
        )
      default:
        return 'No session records yet. Start a conversation to create one.'
    }
  })()

  return (
    <div className="bg-background-secondary/50 mt-1 flex items-center justify-center rounded-lg pb-6 pt-4">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="rotate-[-16deg] translate-y-2">
            <Icon type="user" size="lg" />
          </div>

          <div className="rounded-md bg-[#49EA99]/90 p-0.5 rotate-[6deg] -translate-y-2">
            <Icon type="rwaka-chat" size="sm" />
          </div>
        </div>



        <div className="flex flex-col items-center gap-2">
          <h3 className="text-primary text-sm font-medium">No Session found</h3>
          <p className="text-muted max-w-[210px] text-center text-sm">
            {errorMessage}
          </p>
        </div>
      </div>
    </div>
  )
}

export default SessionBlankState

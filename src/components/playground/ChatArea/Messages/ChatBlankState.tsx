'use client'

import Link from 'next/link'
import { motion, Variants, AnimatePresence } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { LEGAL_CATEGORIES } from '@/constants'
import { ChevronDown, ExternalLink } from 'lucide-react'
import useAIChatStreamHandler from '@/hooks/useAIStreamHandler'
import { usePlaygroundStore } from '@/store'
import { useSearchParams } from 'next/navigation'
import { useAccessControl } from '@/hooks/useAccessControl'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'

const USER_ROLES = [
  'Lawyers',
  'Judges',
  'Auditors',
  'Notaries',
  'Counsel',
  'Reviewers',
  'Mediators'
]

const ChatBlankState = () => {
  const { handleStreamResponse } = useAIChatStreamHandler()
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0)
  const [, setActiveCategory] = useState<string | null>(null)
  const { agents } = usePlaygroundStore()
  const { userName } = useAccessControl()
  const searchParams = useSearchParams()
  const agentId = searchParams?.get('agent')
  const agentLabel = agents.find((a) => a.value === agentId)?.label
  const matchedCategory = LEGAL_CATEGORIES.find(
    (category) => category.name.toLowerCase() === agentLabel?.toLowerCase()
  )

  const dropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveCategory(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRoleIndex((prevIndex) => (prevIndex + 1) % USER_ROLES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const roleVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 }
  }

  const handleQuery = async (query: string) => {
    try {
      await handleStreamResponse(query)
    } catch (error) {
      toast.error(
        `Error in handling query: ${error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  return (
    <section className="font-geist flex flex-col items-center justify-center">
      <div className="flex flex-col gap-y-6">
        <div className="mx-auto flex w-fit items-center justify-center gap-3 rounded-xl bg-[#0C555D] px-5 py-2 text-base shadow-lg ring-1 ring-white/10 backdrop-blur-md">
          <span className="font-semibold text-white">
            Hello {userName || 'User'}
          </span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="px-4 text-xl font-[600] tracking-tight sm:text-2xl md:text-3xl"
        >
          <div className="mb-2 flex flex-wrap justify-center gap-x-3 text-base font-medium sm:text-xl md:text-2xl">
            <p className="flex items-center font-[600]">Designed to assist</p>
            {matchedCategory?.name === 'USERS LEGAL EXPERT' ? (
              <>
                <span className="relative inline-flex h-[40px] min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-white px-3 text-sm font-semibold text-black hover:scale-[1.05] md:text-lg">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={USER_ROLES[currentRoleIndex]}
                      className="absolute rounded-md px-3 py-1 text-xl font-semibold text-black"
                      style={{ transform: 'skewX(-6deg)' }}
                      variants={roleVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.4 }}
                    >
                      <span style={{ transform: 'skewX(6deg)' }}>
                        {USER_ROLES[currentRoleIndex]}
                      </span>
                    </motion.span>
                  </AnimatePresence>
                </span>
              </>
            ) : (
              <span className="relative inline-flex h-[40px] w-fit cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-white px-4 text-[12px] font-bold text-black hover:scale-[1.05] md:text-[13px] lg:text-[16px]">
                {matchedCategory?.name}S
              </span>
            )}
          </div>
          <div className="mt-4 flex w-full flex-col gap-3 px-4 text-center text-base leading-tight">
            <p className="align-top">
              Can:{' '}
              <span className="align-top font-light">
                {matchedCategory?.ability.can}
              </span>
            </p>
            <p className="align-top">
              Can not:{' '}
              <span className="align-top font-light">
                {matchedCategory?.ability.cannot}
              </span>
            </p>
          </div>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative flex w-full flex-wrap justify-center gap-3 px-4"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="">
              <button
                className="px-4 py-2 text-sm font-dmmono tracking-tight border border-border hover:bg-neutral-800 rounded-xl flex items-center gap-2 "
              >
                <span>VIEW SAMPLE {matchedCategory?.name} QUESTIONS</span>
                <ChevronDown size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-border">
              {matchedCategory?.questions.map((q, idx) => (
                <DropdownMenuItem
                  key={idx}
                  onClick={() => handleQuery(q)}
                  className="flex justify-between"
                >
                  <span className='break-words max-w-[300px] md:max-w-[500px]'>{q}</span>
                  <ExternalLink size={16} className="text-gray-400" />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </div>
    </section>
  )
}

export default ChatBlankState

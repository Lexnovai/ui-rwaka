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

const USER_ROLES = [
  'Lawyers',
  'Judges',
  'Auditors',
  'Notaries',
  'Counsel',
  'Reviewers',
  'Mediators'
]

interface ActionButtonProps {
  href?: string
  variant?: 'primary'
  text: React.ReactNode
  isFocused?: boolean
  onClick?: () => void
  onFocus?: () => void
}

const ActionButton = ({
  variant,
  text,
  isFocused,
  onClick,
  onFocus
}: ActionButtonProps) => {
  const baseStyles =
    'px-4 py-2 text-sm transition-colors font-dmmono tracking-tight'
  const variantStyles = {
    primary: 'border border-border hover:bg-neutral-800 rounded-xl'
  }

  return (
    <button
      onClick={onClick}
      onFocus={onFocus}
      className={`${baseStyles} ${variant ? variantStyles[variant] : ''} ${isFocused ? 'bg-neutral-800' : ''}`}
    >
      {text}
    </button>
  )
}

const ChatBlankState = () => {
  const { handleStreamResponse } = useAIChatStreamHandler()
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const { agents } = usePlaygroundStore()
  const searchParams = useSearchParams()
  const agentId = searchParams.get('agent')
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
        `Error in handling query: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  return (
    <section
      className="font-geist flex flex-col items-center text-center"
      aria-label="Welcome message"
    >
      <div className="flex max-w-3xl flex-col gap-y-6 md:max-w-4xl lg:max-w-6xl">
        <div className="mx-auto flex w-fit items-center justify-center gap-3 rounded-xl bg-[#0C555D] px-5 py-2 text-sm shadow-lg ring-1 ring-white/10 backdrop-blur-md">
          <span className="font-semibold text-white">Free Plan</span>
          <Link
            href="/upgrade"
            className="flex items-center gap-1 text-[#49EA99] transition-opacity duration-200 hover:opacity-80"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
            <span className="underline">Upgrade</span>
          </Link>
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
          <div className="mt-4 flex w-full flex-col gap-3 px-4 text-center text-[15px] leading-tight sm:text-[16px]">
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
          <ActionButton
            key={matchedCategory?.name}
            variant="primary"
            text={
              <div className="items-centert flex gap-2 text-sm">
                <span>VIEW SAMPLE {matchedCategory?.name} QUESTIONS</span>
                <ChevronDown />
              </div>
            }
            onClick={() => setActiveCategory(matchedCategory?.name ?? null)}
          />

          {activeCategory && (
            <div
              ref={dropdownRef}
              className="border-border top-full z-10 mt-4 w-full rounded-xl border bg-neutral-900 p-3 shadow-xl sm:absolute sm:left-1/2 sm:-translate-x-1/2"
            >
              {matchedCategory && (
                <div className="mx-auto max-h-60 w-full max-w-2xl space-y-2 overflow-y-auto">
                  {matchedCategory.questions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuery(q)}
                      className="group relative flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm text-gray-200 hover:bg-neutral-800"
                    >
                      <span>{q}</span>
                      <ExternalLink
                        className="text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"
                        size={16}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default ChatBlankState

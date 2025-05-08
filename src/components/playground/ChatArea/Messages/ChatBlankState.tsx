'use client'

import Link from 'next/link'
import { motion, Variants, AnimatePresence } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import useAIChatStreamHandler from '@/hooks/useAIStreamHandler'
import { LandPlot, Users2, Briefcase, ExternalLink } from 'lucide-react'

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
  href: string
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

const LEGAL_CATEGORIES = [
  {
    name: 'Land Law',
    icon: LandPlot,
    questions: [
      'How do I transfer land ownership in Rwanda?',
      'What documents are needed for land registration?',
      'What are the laws around land disputes?'
    ]
  },
  {
    name: 'Family Law',
    icon: Users2,
    questions: [
      'What are the grounds for divorce in Rwanda?',
      'How is child custody decided legally?',
      'Can I get married without a church wedding?'
    ]
  },
  {
    name: 'Business Law',
    icon: Briefcase,
    questions: [
      'How do I register a company in Rwanda?',
      'What taxes do small businesses pay?',
      'Can a foreigner open a business in Rwanda?'
    ]
  }
]

const ChatBlankState = () => {
  const { handleStreamResponse } = useAIChatStreamHandler()
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
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
      className="font-geist flex flex-grow flex-col items-center justify-start overflow-y-auto pt-12 text-center"
      aria-label="Welcome message"
    >
      <div className="flex max-w-3xl flex-col gap-y-8">
        <div className="mx-auto flex w-fit items-center justify-center gap-3 rounded-xl bg-blue-600 px-3 py-1 text-sm text-white">
          <span>Free Plan</span>
          <Link
            href="/upgrade"
            className="text-white underline hover:text-gray-200"
          >
            Upgrade to Premium
          </Link>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-2xl font-[600] tracking-tight sm:text-3xl"
        >
          <div className="mb-2 flex items-center justify-center gap-x-5 whitespace-nowrap font-medium">
            <p className="flex items-center font-[600]">Designed to assist </p>
            <span className="relative inline-flex h-[40px] w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-white hover:scale-[1.05]">
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
          </div>
          <p>Curious? Kick off with your first question.</p>
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative flex flex-wrap justify-center gap-3"
        >
          {LEGAL_CATEGORIES.map(({ name, icon: Icon }) => (
            <ActionButton
              key={name}
              variant="primary"
              href="#"
              text={
                <div className="flex items-center gap-2">
                  <Icon size={16} />
                  <span>{name}</span>
                </div>
              }
              onClick={() =>
                setActiveCategory((prev) => (prev === name ? null : name))
              }
            />
          ))}

          {activeCategory && (
            <div className="border-border top-full mt-4 w-full rounded-xl border bg-neutral-900 p-4 shadow-xl">
              {LEGAL_CATEGORIES.find(
                (c) => c.name === activeCategory
              )?.questions.map((q, idx) => (
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
        </motion.div>
      </div>
    </section>
  )
}

export default ChatBlankState

'use client'

import Link from 'next/link'
import { motion, Variants, AnimatePresence } from 'framer-motion'
import React, { useEffect, useState } from 'react'

const EXTERNAL_LINKS = {
  documentation: '/docs',
  playground: '/demo'
}

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
  text: string
}

const ActionButton = ({ href, variant, text }: ActionButtonProps) => {
  const baseStyles =
    'px-4 py-2 text-sm transition-colors font-dmmono tracking-tight'
  const variantStyles = {
    primary: 'border border-border hover:bg-neutral-800 rounded-xl'
  }

  return (
    <Link
      href={href}
      className={`${baseStyles} ${variant ? variantStyles[variant] : ''}`}
    >
      {text}
    </Link>
  )
}

const ChatBlankState = () => {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0)

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

  return (
    <section
      className="font-geist flex flex-col items-center text-center"
      aria-label="Welcome message"
    >
      <div className="flex max-w-3xl flex-col gap-y-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-3xl font-[600] tracking-tight"
        >
          <div className="mb-2 flex items-center justify-center gap-x-5 whitespace-nowrap font-medium">
            <p className="flex items-center font-[600]">Designed to empower </p>
            <span className="relative inline-flex h-[40px] w-[120px] items-center justify-center overflow-hidden rounded-xl bg-white">
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
          className="flex justify-center gap-4"
        >
          <ActionButton
            href={EXTERNAL_LINKS.playground}
            text="START A NEW CONVERSATION"
          />
        </motion.div>
      </div>
    </section>
  )
}

export default ChatBlankState

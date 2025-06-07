'use client'
import { UserProfile } from '@/interface/profile'
import { getProfile } from '@/service/profile.service'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger
// } from '@/components/ui/dropdown-menu'
// import { Ellipsis } from 'lucide-react'

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    console.log('Starting profile fetch...')

    toast.promise(getProfile(), {
      loading: 'Loading profile...',
      success: (res) => {
        console.log('Profile success:', res)
        setProfile(res.payload)
        return 'Profile loaded!'
      },
      error: (err) => {
        console.error('Profile error:', err)
        return err.response?.message || 'Error loading profile!'
      }
    })
  }, [])
  return (
    <div className="border-border m-8 flex h-fit flex-col rounded-xl border p-8">
      <div className="flex">
        <h1 className="mb-4 text-2xl font-bold">Profile Page</h1>
        {/* <DropdownMenu>
          <DropdownMenuTrigger>
            <Ellipsis className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
      {profile ? (
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-2 text-xl font-semibold">{profile.name}</h2>
          <p className="mb-2 text-gray-700">Email: {profile.email}</p>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  )
}

export default ProfilePage

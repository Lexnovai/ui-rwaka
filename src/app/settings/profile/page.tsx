'use client'
import React, { useEffect, useState } from 'react'
import { useProfileStore } from '@/store'
import { User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const ProfilePage = () => {
  const { profile, fetchProfile } = useProfileStore()

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const fallbackProfile = {
    name: 'Your Name',
    email: 'Your Email',
    role: 'Legal Assistant',
    phone: '0782123456',
    location: 'Your Location',
    bio: 'A brief bio about yourself'
  }
  const displayProfile = profile || fallbackProfile

  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const [isEditingChat, setIsEditingChat] = useState(false)
  const [formData, setFormData] = useState(displayProfile)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = (section: 'personal' | 'address') => {
    if (section === 'personal') {
      setIsEditingPersonal(false)
    } else {
      setIsEditingChat(false)
    }
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="flex items-center justify-between px-8 py-4">
        <div className="text-muted-foreground flex items-center gap-8 text-sm font-medium">
          <span className="text-lg font-bold text-white">
            Profile Information
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="border border-neutral-800">
            Back to Chat
          </Button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <User className="h-5 w-5 text-black" />
          </div>
        </div>
      </header>

      <main className="m-8 space-y-8 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <User className="h-12 w-12 text-gray-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{formData.name}</h2>
              <p className="text-gray-500">{formData.email}</p>
              <p className="text-sm text-gray-400">{formData.role}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-neutral-800 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Personal Information</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-gray-400">First Name</span>
              <Input
                value={formData.name.split(' ')[0]}
                onFocus={() => setIsEditingPersonal(true)}
                onChange={(e) =>
                  handleChange(
                    'name',
                    `${e.target.value} ${formData.name.split(' ')[1]}`
                  )
                }
                className="h-12 text-gray-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-gray-400">Last Name</span>
              <Input
                value={formData.name.split(' ')[1]}
                onFocus={() => setIsEditingPersonal(true)}
                onChange={(e) =>
                  handleChange(
                    'name',
                    `${formData.name.split(' ')[0]} ${e.target.value}`
                  )
                }
                className="h-12 text-gray-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-gray-400">Email address</span>
              <Input
                value={formData.email}
                onFocus={() => setIsEditingPersonal(true)}
                onChange={(e) => handleChange('email', e.target.value)}
                className="h-12 text-gray-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-gray-400">Phone</span>
              <Input
                placeholder="0782123456"
                value={formData.phone}
                onFocus={() => setIsEditingPersonal(true)}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="h-12 text-gray-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-gray-400">Location</span>
              <Input
                placeholder="Add your location"
                value={formData.location}
                onFocus={() => setIsEditingPersonal(true)}
                onChange={(e) => handleChange('location', e.target.value)}
                className="h-12 text-gray-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-gray-400">Role</span>
              <Input
                placeholder="Add your role"
                value={formData.role}
                onFocus={() => setIsEditingPersonal(true)}
                onChange={(e) => handleChange('role', e.target.value)}
                className="h-12 text-gray-400"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <span className="text-gray-400">Bio</span>
              <Input
                value={formData.bio}
                onFocus={() => setIsEditingPersonal(true)}
                onChange={(e) => handleChange('bio', e.target.value)}
                className="h-12 text-gray-400"
              />
            </div>
          </div>
          {isEditingPersonal && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => handleSave('personal')}
                className="gap-2 border border-neutral-800"
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-xl border border-neutral-800 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Preferences</h3>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-400">
              How would you like to modify your Assistant?
            </span>
            <Textarea
              onFocus={() => setIsEditingChat(true)}
              onChange={(e) => handleChange('instructions', e.target.value)}
              className="h-24 border border-neutral-800"
              placeholder="e.g Give detailed explanations on my questions"
            />
          </div>
          {isEditingChat && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => handleSave('address')}
                className="gap-2 border border-neutral-800"
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button variant="destructive" className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </main>
    </div>
  )
}

export default ProfilePage

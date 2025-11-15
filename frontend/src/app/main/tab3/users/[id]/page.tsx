'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import { ArrowLeft } from 'lucide-react'
import { apiClient, User, Role } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roles: ['user'] as string[],
    isActive: true,
  })
  const [availableRoles, setAvailableRoles] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchUser()
    fetchRoles()
  }, [userId])

  const fetchRoles = async () => {
    try {
      const roles = await apiClient.getRoles()
      setAvailableRoles(
        roles.map((role: Role) => ({
          value: role.name,
          label: role.name.charAt(0).toUpperCase() + role.name.slice(1)
        }))
      )
    } catch (error) {
      console.error('Failed to fetch roles:', error)
    }
  }

  const fetchUser = async () => {
    try {
      const user = await apiClient.getUser(userId)
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        roles: user.roles || ['user'],
        isActive: user.isActive,
      })
    } catch (error: any) {
      console.error('Error fetching user:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to load user',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRolesChange = (roles: string[]) => {
    setFormData(prev => ({
      ...prev,
      roles: roles.length > 0 ? roles : ['user']
    }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Only send password if it's been changed
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        roles: formData.roles,
        isActive: formData.isActive,
      }

      // Only include password if provided and not empty
      if (formData.password && formData.password.trim()) {
        updateData.password = formData.password.trim()
      }

      await apiClient.updateUser(userId, updateData)
      toast({
        title: 'Success',
        description: 'User updated successfully',
      })
      router.push('/main/tab3/users')
    } catch (error: any) {
      console.error('Error updating user:', error)

      // Extract error message from response
      let errorMessage = 'Failed to update user'
      if (error.message) {
        errorMessage = error.message
      }

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/main/tab3/users')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <h1 className="text-3xl font-bold">Edit User</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Enter user name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="Enter email address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Enter new password (leave empty to keep current)"
          />
          <p className="text-sm text-muted-foreground">
            Leave empty to keep current password
          </p>
        </div>

        <div className="space-y-2">
          <Label>Roles</Label>
          <MultiSelect
            options={availableRoles}
            selected={formData.roles}
            onChange={handleRolesChange}
            placeholder="Search and select roles..."
          />
          <p className="text-sm text-muted-foreground">
            Select one or more roles for this user. Type to search.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.isActive.toString()}
            onValueChange={(value) =>
              setFormData({ ...formData, isActive: value === 'true' })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/main/tab3/users')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

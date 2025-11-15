'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { apiClient, Role } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

export default function NewUserPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roles: ['user'],
    isActive: true,
  })
  const [availableRoles, setAvailableRoles] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRoles()
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Clean up form data - remove empty password to avoid validation errors
      const cleanedData: any = {
        ...formData,
        password: formData.password.trim() || undefined
      }

      // Remove undefined fields
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === undefined) {
          delete cleanedData[key]
        }
      })

      await apiClient.createUser(cleanedData)
      toast({
        title: 'Success',
        description: 'User created successfully',
      })
      router.push('/main/tab3/users')
    } catch (error: any) {
      console.error('Error creating user:', error)

      // Extract error message from response
      let errorMessage = 'Failed to create user'
      if (error.message) {
        errorMessage = error.message
      }

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
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
        <h1 className="text-3xl font-bold">Add New User</h1>
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
            placeholder="Enter password (leave empty for SSO-only users)"
          />
          <p className="text-sm text-muted-foreground">
            Leave empty if user will only login via SSO
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="roles">
            Roles <span className="text-destructive">*</span>
          </Label>
          <MultiSelect
            options={availableRoles}
            selected={formData.roles}
            onChange={(roles) => setFormData({ ...formData, roles })}
            placeholder="Select roles..."
          />
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
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
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

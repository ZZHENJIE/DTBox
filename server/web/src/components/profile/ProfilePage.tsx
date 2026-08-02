import { useState, useEffect, useCallback } from 'react'
import { User } from 'lucide-react'
import { useAuth } from '~/hooks/use-auth'
import { useApi } from '~/hooks/use-api'
import type { InfoResult } from '~/types/api'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Skeleton } from '~/components/ui/skeleton'

export function ProfilePage() {
  const { user, loading: authLoading, refetch: refetchUser } = useAuth()
  const { loading: saving, execute } = useApi<InfoResult>()

  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setAvatar(user.avatar)
    }
  }, [user])

  const handleSave = useCallback(async () => {
    setSaved(false)
    const body: Record<string, string> = {}
    if (name !== user?.name) body.name = name
    if (avatar !== user?.avatar) body.avatar = avatar

    if (Object.keys(body).length === 0) return

    const result = await execute({
      method: 'POST',
      path: '/api/user/profile',
      body,
    })

    if (result) {
      setSaved(true)
      refetchUser()
      setTimeout(() => setSaved(false), 3000)
    }
  }, [name, avatar, user, execute, refetchUser])

  if (authLoading) {
    return (
      <div className="p-8 max-w-md">
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <User className="size-5" />
        <h2 className="text-lg font-semibold">个人中心</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">用户名</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="用户名"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="avatar">头像 URL</Label>
          <Input
            id="avatar"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存修改'}
          </Button>
          {saved && (
            <span className="text-xs text-green-600">保存成功</span>
          )}
        </div>
      </div>
    </div>
  )
}

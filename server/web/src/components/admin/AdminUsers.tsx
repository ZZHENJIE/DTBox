import { useState, useEffect, useCallback } from 'react'
import { Shield } from 'lucide-react'
import { useApi } from '~/hooks/use-api'
import type { AdminInfoResult, InfoResult } from '~/types/api'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Skeleton } from '~/components/ui/skeleton'

export function AdminUsers() {
  const [page, setPage] = useState(1)
  const { data, loading, execute } = useApi<AdminInfoResult>()
  const [editingUser, setEditingUser] = useState<InfoResult | null>(null)

  const fetchUsers = useCallback(() => {
    execute({ method: 'GET', path: `/api/admin/info/${page}` })
  }, [page, execute])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="size-5" />
        <h2 className="text-lg font-semibold">用户管理</h2>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>用户名</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-xs text-muted-foreground">{user.id}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        user.role === 5
                          ? 'bg-red-500/10 text-red-600'
                          : user.role === 2
                            ? 'bg-blue-500/10 text-blue-600'
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {user.role === 5 ? '管理员' : user.role === 2 ? '订阅者' : '用户'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                      >
                        编辑
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data || data.users.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {data && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">
                共 {data.total} 条，第 {data.page}/{Math.ceil(data.total / data.page_size)} 页
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= Math.ceil(data.total / data.page_size)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={true}
          onClose={() => setEditingUser(null)}
          onSaved={fetchUsers}
        />
      )}
    </div>
  )
}

interface EditUserDialogProps {
  user: InfoResult
  open: boolean
  onClose: () => void
  onSaved: () => void
}

const ROLE_OPTIONS = [
  { value: 1, label: '用户' },
  { value: 2, label: '订阅者' },
  { value: 5, label: '管理员' },
]

function EditUserDialog({ user, open, onClose, onSaved }: EditUserDialogProps) {
  const [name, setName] = useState(user.name)
  const [role, setRole] = useState(user.role)
  const [avatar, setAvatar] = useState(user.avatar)
  const { loading, execute } = useApi<InfoResult>()
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    setMessage('')
    const body: Record<string, unknown> = { user_id: user.id }
    if (name !== user.name) body.name = name
    if (role !== user.role) body.role = role
    if (avatar !== user.avatar) body.avatar = avatar

    const result = await execute({
      method: 'POST',
      path: '/api/admin/change',
      body,
    })

    if (result !== null) {
      onSaved()
      onClose()
    } else {
      setMessage('保存失败')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>编辑用户 #{user.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">用户名</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-role">角色</Label>
            <select
              id="edit-role"
              value={role}
              onChange={(e) => setRole(Number(e.target.value))}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-avatar">头像 URL</Label>
            <Input
              id="edit-avatar"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </div>
          {message && <p className="text-xs text-destructive">{message}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>取消</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

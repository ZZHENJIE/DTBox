import { useState, useCallback } from 'react'
import { Key } from 'lucide-react'
import { useApi } from '~/hooks/use-api'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

export function PasswordChange() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { loading, execute } = useApi()

  const handleSubmit = useCallback(async () => {
    setMessage(null)

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: '请填写所有字段' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '两次输入的新密码不一致' })
      return
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: '新密码长度至少 8 位' })
      return
    }

    const result = await execute({
      method: 'POST',
      path: '/api/user/password',
      body: { old_password: oldPassword, new_password: newPassword },
    })

    if (result !== null) {
      setMessage({ type: 'success', text: '密码修改成功' })
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }, [oldPassword, newPassword, confirmPassword, execute])

  return (
    <div className="p-8 max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <Key className="size-5" />
        <h2 className="text-lg font-semibold">修改密码</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="old-password">旧密码</Label>
          <Input
            id="old-password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="输入旧密码"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new-password">新密码</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="输入新密码，至少 8 位"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">确认新密码</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="再次输入新密码"
          />
        </div>

        {message && (
          <p className={`text-xs ${message.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>
            {message.text}
          </p>
        )}

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? '修改中...' : '修改密码'}
        </Button>
      </div>
    </div>
  )
}

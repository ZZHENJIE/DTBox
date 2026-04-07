import { useState } from 'react';
import {
  Title,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Paper,
  Text,
  Divider,
  Alert,
  Group,
  Badge,
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/auth';

export function ProfilePage() {
  const { user, setUser } = useAuthStore();
  
  // 用户名修改
  const [username, setUsername] = useState(user?.username || '');
  const [usernameLoading, setUsernameLoading] = useState(false);
  
  // 密码修改
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const getRoleLabel = (permissions: number) => {
    switch (permissions) {
      case 5:
        return { label: '管理员', color: 'red' };
      case 1:
        return { label: '高级用户', color: 'blue' };
      default:
        return { label: '普通用户', color: 'gray' };
    }
  };

  const role = user ? getRoleLabel(user.permissions) : { label: '-', color: 'gray' };

  // 处理用户名修改
  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      notifications.show({
        title: '提示',
        message: '用户名不能为空',
        color: 'yellow',
      });
      return;
    }

    if (username === user?.username) {
      notifications.show({
        title: '提示',
        message: '用户名没有变化',
        color: 'yellow',
      });
      return;
    }

    setUsernameLoading(true);
    try {
      const updatedUser = await authService.updateUsername(username);
      setUser(updatedUser);
      notifications.show({
        title: '成功',
        message: '用户名修改成功',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: '失败',
        message: error instanceof Error ? error.message : '用户名修改失败',
        color: 'red',
      });
    } finally {
      setUsernameLoading(false);
    }
  };

  // 处理密码修改
  const handleUpdatePassword = async () => {
    setPasswordError('');

    if (!oldPassword) {
      setPasswordError('请输入当前密码');
      return;
    }

    if (!newPassword) {
      setPasswordError('请输入新密码');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('新密码长度至少为 6 个字符');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不一致');
      return;
    }

    if (oldPassword === newPassword) {
      setPasswordError('新密码不能与当前密码相同');
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.updatePassword(oldPassword, newPassword);
      notifications.show({
        title: '成功',
        message: '密码修改成功',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      // 清空密码输入
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      notifications.show({
        title: '失败',
        message: error instanceof Error ? error.message : '密码修改失败',
        color: 'red',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Stack gap="xl">
      {/* 个人信息卡片 */}
      <Paper withBorder radius="md" p="xl">
        <Title order={2} mb="lg">个人信息</Title>

        <Stack>
          <Group>
            <Text fw={500}>用户名：</Text>
            <Text>{user?.username || '-'}</Text>
          </Group>

          <Group>
            <Text fw={500}>用户ID：</Text>
            <Text>{user?.id || '-'}</Text>
          </Group>

          <Group>
            <Text fw={500}>权限等级：</Text>
            <Badge color={role.color}>{role.label}</Badge>
          </Group>

          <Group>
            <Text fw={500}>注册时间：</Text>
            <Text>{user?.createdAt || '-'}</Text>
          </Group>
        </Stack>
      </Paper>

      {/* 账户设置卡片 */}
      <Paper withBorder radius="md" p="xl">
        <Title order={2} mb="lg">账户设置</Title>

        <Stack gap="lg">
          {/* 用户名修改 */}
          <div>
            <Text fw={500} mb="xs">修改用户名</Text>
            <Stack gap="sm">
              <TextInput
                placeholder="请输入新用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                description="用户名长度 3-32 个字符"
              />
              <Button
                onClick={handleUpdateUsername}
                loading={usernameLoading}
                disabled={username === user?.username}
              >
                保存用户名
              </Button>
            </Stack>
          </div>

          <Divider />

          {/* 密码修改 */}
          <div>
            <Text fw={500} mb="xs">修改密码</Text>
            <Stack gap="sm">
              <PasswordInput
                label="当前密码"
                placeholder="请输入当前密码"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <PasswordInput
                label="新密码"
                placeholder="请输入新密码"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                description="密码长度至少为 6 个字符"
              />
              <PasswordInput
                label="确认新密码"
                placeholder="请再次输入新密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              
              {passwordError && (
                <Alert 
                  icon={<IconAlertCircle size={16} />} 
                  color="red"
                  variant="light"
                >
                  {passwordError}
                </Alert>
              )}
              
              <Button
                onClick={handleUpdatePassword}
                loading={passwordLoading}
              >
                修改密码
              </Button>
            </Stack>
          </div>
        </Stack>
      </Paper>
    </Stack>
  );
}

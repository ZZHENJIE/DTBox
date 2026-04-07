import {
  Title,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Text,
  Anchor,
  Paper,
  Center,
} from '@mantine/core';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

import { authService } from '../services/auth';

export function RegisterPage() {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      notifications.show({
        title: '错误',
        message: '两次输入的密码不一致',
        color: 'red',
      });
      return;
    }

    if (password.length < 6) {
      notifications.show({
        title: '错误',
        message: '密码长度至少为 6 个字符',
        color: 'red',
      });
      return;
    }

    setLoading(true);

    try {
      await authService.register({ username, password });

      notifications.show({
        title: '注册成功',
        message: '请使用新账号登录',
        color: 'green',
      });

      navigate('/login');
    } catch (error) {
      notifications.show({
        title: '注册失败',
        message: error instanceof Error ? error.message : '注册时发生错误',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center h="calc(100vh - 100px)">
      <Paper radius="md" p="xl" withBorder maw={400} w="100%">
        <Title order={2} ta="center" mb="md">
          注册
        </Title>

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="用户名"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
            />

            <PasswordInput
              label="密码"
              placeholder="请输入密码（至少6位）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            <PasswordInput
              label="确认密码"
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} fullWidth>
              注册
            </Button>
          </Stack>
        </form>

        <Text ta="center" mt="md">
          已有账号？{' '}
          <Anchor component={Link} to="/login">
            立即登录
          </Anchor>
        </Text>
      </Paper>
    </Center>
  );
}

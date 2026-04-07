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
} from "@mantine/core";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";

import { authService } from "../services/auth";
import { useAuthStore } from "../stores/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      notifications.show({
        title: "提示",
        message: "请输入用户名和密码",
        color: "yellow",
      });
      return;
    }

    setLoading(true);

    try {
      // 登录
      await authService.login({ username, password });

      // 获取用户信息
      const user = await authService.getCurrentUser();

      // 更新状态
      setUser(user);

      notifications.show({
        title: "登录成功",
        message: `欢迎回来，${user.username}！`,
        color: "green",
      });

      // 跳转到首页
      navigate("/", { replace: true });
    } catch (error) {
      notifications.show({
        title: "登录失败",
        message: error instanceof Error ? error.message : "请检查用户名和密码",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理表单提交，阻止默认行为
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <Center h="calc(100vh - 100px)">
      <Paper radius="md" p="xl" withBorder maw={400} w="100%">
        <Title order={2} ta="center" mb="md">
          登录
        </Title>

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="用户名"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <PasswordInput
              label="密码"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} fullWidth>
              登录
            </Button>
          </Stack>
        </form>

        <Text ta="center" mt="md">
          还没有账号？{" "}
          <Anchor component={Link} to="/register">
            立即注册
          </Anchor>
        </Text>
      </Paper>
    </Center>
  );
}

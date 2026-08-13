import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

import { useAuth } from "~/hooks/use-auth";
import { isTauri } from "~/lib/tauri";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "login") {
        await login(name, password);
      } else {
        await register(name, password);
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">DTBox</CardTitle>
          <CardDescription>登录或注册以继续</CardDescription>
        </CardHeader>
        <CardContent>
          {!isTauri() && (
            <div className="border-destructive/40 bg-destructive/10 text-destructive mb-4 flex items-start gap-2 rounded-md border px-3 py-2 text-xs">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                未运行在 Tauri 环境中，无法通过 IPC 完成认证。请在桌面客户端中打开 Web
                子窗口。
              </span>
            </div>
          )}

          <Tabs value={mode} onValueChange={setMode}>
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>

            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">用户名</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="至少 5 位，字母/数字/下划线"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少 8 位，含大小写与数字"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                />
              </div>

              {error && (
                <p className="text-destructive text-sm" role="alert">
                  {error}
                </p>
              )}

              <TabsContent value="login">
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "登录中…" : "登录"}
                </Button>
              </TabsContent>

              <TabsContent value="register">
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "注册中…" : "注册并登录"}
                </Button>
              </TabsContent>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

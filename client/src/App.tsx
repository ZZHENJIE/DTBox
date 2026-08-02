import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Settings, loadSettings, saveSettings } from "./settings";

type Screen = "settings" | "login" | "register" | "logged_in";

function App() {
  const [screen, setScreen] = useState<Screen>("settings");
  const [settings, setSettings] = useState<Settings>({ host: "", port: 80 });
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [wsPort, setWsPort] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const saved = loadSettings();
      if (!saved) return;
      setSettings(saved);
      await invoke("set_server_url", {
        url: `http://${saved.host}:${saved.port}`,
      });
      try {
        const result: [string, number] = await invoke("try_auto_login");
        setWsPort(result[1]);
        setScreen("logged_in");
      } catch {
        setScreen("login");
      }
    })();
  }, []);

  async function handleSaveSettings() {
    if (!settings.host.trim()) {
      setError("Host is required");
      return;
    }
    setError("");
    saveSettings(settings);
    await invoke("set_server_url", {
      url: `http://${settings.host}:${settings.port}`,
    });
    setScreen("login");
  }

  async function handleLogin() {
    if (!name.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await invoke("do_login", { name, password });
      const port: number = await invoke("start_ws_server");
      setWsPort(port);
      setScreen("logged_in");
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!name.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await invoke("do_register", { name, password });
      setName("");
      setPassword("");
      setConfirmPassword("");
      setScreen("login");
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleOpen() {
    try {
      await invoke("open_web_page", { webUrl: `http://${settings.host}:${settings.port}`, wsPort });
    } catch (e) {
      setError(String(e));
    }
  }

  async function handleLogout() {
    setLoading(true);
    setError("");
    try {
      await invoke("do_logout");
      setScreen("login");
      setName("");
      setPassword("");
      setWsPort(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  if (screen === "settings") {
    return (
      <main style={mainStyle}>
        <h1 style={h1Style}>DTBox Setup</h1>
        <div style={groupStyle}>
          <Label>Server Host</Label>
          <Input
            value={settings.host}
            onChange={(v) => setSettings({ ...settings, host: v })}
            placeholder="example.com"
          />
        </div>
        <div style={groupStyle}>
          <Label>Server Port</Label>
          <Input
            value={String(settings.port)}
            type="number"
            onChange={(v) =>
              setSettings({ ...settings, port: parseInt(v) || 80 })
            }
            placeholder="80"
          />
        </div>
        {error && <ErrorBox msg={error} />}
        <Btn label="Save & Continue" onClick={handleSaveSettings} />
      </main>
    );
  }

  if (screen === "login") {
    return (
      <main style={mainStyle}>
        <h1 style={h1Style}>DTBox Login</h1>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 16 }}>
          Server: {settings.host}:{settings.port}
        </div>
        <div style={groupStyle}>
          <Label>Username</Label>
          <Input value={name} onChange={setName} placeholder="username" />
        </div>
        <div style={groupStyle}>
          <Label>Password</Label>
          <Input
            value={password}
            onChange={setPassword}
            type="password"
            placeholder="password"
          />
        </div>
        {error && <ErrorBox msg={error} />}
        <Btn label={loading ? "Logging in..." : "Login"} onClick={handleLogin} />
        <Link onClick={() => { setError(""); setName(""); setPassword(""); setScreen("register"); }}>
          No account? Register
        </Link>
        <Link onClick={() => { setError(""); setScreen("settings"); }}>
          Edit server settings
        </Link>
      </main>
    );
  }

  if (screen === "register") {
    return (
      <main style={mainStyle}>
        <h1 style={h1Style}>DTBox Register</h1>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 16 }}>
          Server: {settings.host}:{settings.port}
        </div>
        <div style={groupStyle}>
          <Label>Username</Label>
          <Input value={name} onChange={setName} placeholder="username" />
        </div>
        <div style={groupStyle}>
          <Label>Password</Label>
          <Input
            value={password}
            onChange={setPassword}
            type="password"
            placeholder="password"
          />
        </div>
        <div style={groupStyle}>
          <Label>Confirm Password</Label>
          <Input
            value={confirmPassword}
            onChange={setConfirmPassword}
            type="password"
            placeholder="confirm password"
          />
        </div>
        {error && <ErrorBox msg={error} />}
        <Btn label={loading ? "Registering..." : "Register"} onClick={handleRegister} />
        <Link onClick={() => { setError(""); setScreen("login"); }}>
          Already have an account? Login
        </Link>
        <Link onClick={() => { setError(""); setScreen("settings"); }}>
          Edit server settings
        </Link>
      </main>
    );
  }

  return (
    <main style={mainStyle}>
      <h1 style={h1Style}>DTBox</h1>
      <div style={{ fontSize: 14, color: "#34a853", marginBottom: 16 }}>
        Logged in · WS port: {wsPort}
      </div>
      {error && <ErrorBox msg={error} />}
      <Btn label="Open Web" onClick={handleOpen} />
      <Btn
        label={loading ? "Logging out..." : "Logout"}
        onClick={handleLogout}
      />
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  maxWidth: 420,
  margin: "0 auto",
  padding: "60px 20px",
};

const h1Style: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 24,
  marginBottom: 24,
  color: "#e0e0e0",
};

const groupStyle: React.CSSProperties = { marginBottom: 16 };

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: 12,
        color: "#888",
        marginBottom: 6,
      }}
    >
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      placeholder={placeholder}
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "8px 12px",
        borderRadius: 6,
        border: "1px solid #444",
        background: "#1e1e1e",
        color: "#e0e0e0",
        fontSize: 14,
        fontFamily: "monospace",
        outline: "none",
      }}
    />
  );
}

function Btn({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "10px 16px",
        borderRadius: 6,
        border: "1px solid #444",
        background: "#1e1e1e",
        color: "#e0e0e0",
        fontSize: 14,
        cursor: "pointer",
        marginTop: 8,
      }}
    >
      {label}
    </button>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: 6,
        background: "#3b1515",
        borderLeft: "4px solid #ea4335",
        color: "#f28b82",
        fontSize: 13,
        marginBottom: 12,
        wordBreak: "break-all",
      }}
    >
      {msg}
    </div>
  );
}

function Link({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        background: "none",
        border: "none",
        color: "#8ab4f8",
        fontSize: 13,
        cursor: "pointer",
        marginTop: 16,
        padding: 0,
        fontFamily: "monospace",
      }}
    >
      {children}
    </button>
  );
}

export default App;

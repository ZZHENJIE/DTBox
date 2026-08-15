import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./index.css";

type Status = {
  kind: "idle" | "loading" | "ok" | "error";
  text: string;
};

type UserInfo = {
  user_id: string | null;
  username: string | null;
  avatar: string | null;
};

type User = {
  userId: string;
  username: string;
  avatar: string;
};

const SERVER_URL_KEY = "server_url";

async function fetchUser(): Promise<User | null> {
  const info = await invoke<UserInfo>("get_user_info");
  if (!info.user_id) return null;
  return {
    userId: info.user_id,
    username: info.username ?? info.user_id,
    avatar: info.avatar ?? "",
  };
}

function parseUrl(url: string): { host: string; port: string } {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? "443" : "80"),
    };
  } catch {
    return { host: "localhost", port: "8080" };
  }
}

function App() {
  const [host, setHost] = useState("localhost");
  const [port, setPort] = useState("8080");
  const [savedUrl, setSavedUrl] = useState("");
  const [testedUrl, setTestedUrl] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle", text: "" });
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    (async () => {
      try {
        unlisten = await listen<UserInfo>("auth-state", (event) => {
          const { user_id } = event.payload;
          if (user_id) {
            fetchUser().then((u) => {
              if (u) setUser(u);
            });
          } else {
            setUser(null);
          }
          setStatus({ kind: "idle", text: "" });
        });

        const url = localStorage.getItem(SERVER_URL_KEY) ?? "";
        setSavedUrl(url);
        if (url) {
          const { host: h, port: p } = parseUrl(url);
          setHost(h);
          setPort(p);

          await invoke("set_server_url", { url });
          const ok = await invoke<boolean>("auto_login");
          if (ok) {
            const u = await fetchUser();
            if (u) setUser(u);
          }
        }
      } catch (e) {
        setStatus({ kind: "error", text: String(e) });
      }
    })();
    return () => {
      unlisten?.();
    };
  }, []);

  const builtUrl = `http://${host}:${port}`;
  const tested = testedUrl !== "" && testedUrl === builtUrl;

  const onChangeHost = (value: string) => {
    setHost(value);
    setStatus({ kind: "idle", text: "" });
  };

  const onChangePort = (value: string) => {
    setPort(value);
    setStatus({ kind: "idle", text: "" });
  };

  const save = async () => {
    setBusy(true);
    setStatus({ kind: "loading", text: "Saving..." });
    try {
      await invoke("set_server_url", { url: builtUrl });
      localStorage.setItem(SERVER_URL_KEY, builtUrl);
      setSavedUrl(builtUrl);
      setStatus({ kind: "ok", text: "Saved" });
    } catch (e) {
      setStatus({ kind: "error", text: String(e) });
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    setBusy(true);
    setStatus({ kind: "loading", text: "Testing connection..." });
    const startedAt = performance.now();
    try {
      const version = await invoke<string>("test_connection", { url: builtUrl });
      const elapsed = Math.round(performance.now() - startedAt);
      setTestedUrl(builtUrl);
      setStatus({ kind: "ok", text: `Connected · Server v${version} · ${elapsed}ms` });
    } catch (e) {
      const elapsed = Math.round(performance.now() - startedAt);
      setStatus({ kind: "error", text: `${String(e)} · ${elapsed}ms` });
    } finally {
      setBusy(false);
    }
  };

  const openWeb = async () => {
    setBusy(true);
    setStatus({ kind: "loading", text: "Opening web..." });
    try {
      await invoke("open_web");
      setStatus({ kind: "ok", text: "Opened" });
    } catch (e) {
      setStatus({ kind: "error", text: String(e) });
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    setBusy(true);
    setStatus({ kind: "loading", text: "Logging out..." });
    try {
      await invoke("do_logout");
      setUser(null);
      setStatus({ kind: "idle", text: "" });
    } catch (e) {
      setStatus({ kind: "error", text: String(e) });
    } finally {
      setBusy(false);
    }
  };

  if (user) {
    return (
      <div className="container">
        <header className="header">
          <h1 className="title">DTBox</h1>
          <p className="subtitle">Signed in</p>
        </header>

        <section className="card">
          <div className="user-row">
            <div className="avatar">
              {user.avatar ? (
                <img className="avatar-img" src={user.avatar} alt="" />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
            </div>
            <div className="user-meta">
              <div className="user-name">{user.username}</div>
              <div className="user-id">User ID: {user.userId}</div>
            </div>
          </div>

          <div className="actions">
            <button className="btn btn-primary" onClick={openWeb} disabled={busy}>
              Open Web
            </button>
            <button className="btn btn-secondary" onClick={logout} disabled={busy}>
              Log out
            </button>
          </div>

          <div className={`status status-${status.kind}`}>
            {status.kind === "loading" ? (
              <span className="spinner" />
            ) : status.kind !== "idle" ? (
              <span className="dot" />
            ) : null}
            {status.text}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">DTBox</h1>
        <p className="subtitle">Configure the server to sign in</p>
      </header>

      <section className="card">
        <h2 className="card-title">Server Configuration</h2>

        <div className="field-row">
          <div className="field">
            <label className="label">Host</label>
            <input
              className="input"
              value={host}
              onChange={(e) => onChangeHost(e.target.value)}
              placeholder="localhost"
            />
          </div>
          <div className="field field-port">
            <label className="label">Port</label>
            <input
              className="input"
              value={port}
              onChange={(e) => onChangePort(e.target.value)}
              placeholder="8080"
            />
          </div>
        </div>

        <div className="actions">
          <button className="btn btn-primary" onClick={save} disabled={busy || !tested}>
            Save
          </button>
          <button className="btn btn-secondary" onClick={test} disabled={busy}>
            Test Connection
          </button>
          <button className="btn btn-secondary" onClick={openWeb} disabled={busy || !savedUrl}>
            Open Web
          </button>
        </div>

        <div className={`status status-${status.kind}`}>
          {status.kind === "loading" ? (
            <span className="spinner" />
          ) : status.kind !== "idle" ? (
            <span className="dot" />
          ) : null}
          {status.text}
        </div>

        {status.kind === "idle" && !tested && !busy && (
          <div className="hint">Test the connection before saving</div>
        )}

        {savedUrl && (
          <div className="current">
            <span className="current-label">Current URL</span>
            <span className="current-value">{savedUrl}</span>
          </div>
        )}
      </section>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

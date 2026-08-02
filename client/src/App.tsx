import { useState, useRef } from "react";
import { fetch } from "@tauri-apps/plugin-http";

interface TestResult {
  id: number;
  label: string;
  ok: boolean;
  message: string;
  time: number;
}

function App() {
  const [baseUrl, setBaseUrl] = useState("http://localhost");
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [reqBody, setReqBody] = useState('{"name":"test"}');
  const [headers, setHeaders] = useState("X-Custom-Header: hello\nAuthorization: Bearer token123");
  const idRef = useRef(0);

  async function run(label: string, fn: () => Promise<void>) {
    setLoading(label);
    try {
      await fn();
    } catch (e) {
      // handled in test helper
    }
    setLoading(null);
  }

  async function doFetch(label: string, url: string, init?: RequestInit) {
    const start = performance.now();
    try {
      const response = await fetch(url, init);
      const text = await response.text().catch(() => "(binary)");
      const time = Math.round(performance.now() - start);
      const id = ++idRef.current;
      setResults((prev) => [
        { id, label, ok: response.ok, message: `[${response.status}] ${text}`, time },
        ...prev,
      ]);
    } catch (e) {
      const time = Math.round(performance.now() - start);
      const id = ++idRef.current;
      setResults((prev) => [
        { id, label, ok: false, message: String(e), time },
        ...prev,
      ]);
    }
  }

  function parseHeaders(): [string, string][] {
    return headers
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const idx = l.indexOf(":");
        return idx > 0
          ? [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]
          : [l, ""];
      });
  }

  const h = parseHeaders();
  const headerObj = Object.fromEntries(h);

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "40px 20px 80px",
      }}
    >
      <h1 style={{ fontWeight: 600, fontSize: 22, marginBottom: 24 }}>
        HTTP Client Test
      </h1>

      {/* URL input */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 6 }}
        >
          Base URL
        </label>
        <input
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
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
      </div>

      {/* Buttons row 1: basic requests */}
      <div
        style={{
          fontSize: 12,
          color: "#888",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        GET
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          ["Health", "/api/health"],
          ["Root", "/"],
          ["404", "/not-found"],
        ].map(([label, path]) => (
          <Btn
            key={label}
            label={`GET ${label}`}
            loading={loading}
            onClick={() =>
              run(`GET ${label}`, () => doFetch(`GET ${label}`, baseUrl + path))
            }
          />
        ))}
      </div>

      {/* POST */}
      <div
        style={{
          fontSize: 12,
          color: "#888",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        POST
      </div>
      <div style={{ marginBottom: 12 }}>
        <textarea
          value={reqBody}
          onChange={(e) => setReqBody(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #444",
            background: "#1e1e1e",
            color: "#e0e0e0",
            fontSize: 13,
            fontFamily: "monospace",
            outline: "none",
            resize: "vertical",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          ["POST /api/echo", "/api/echo"],
          ["POST /api/data", "/api/data"],
        ].map(([label, path]) => (
          <Btn
            key={label}
            label={label}
            loading={loading}
            onClick={() =>
              run(label, () =>
                doFetch(label, baseUrl + path, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: reqBody,
                })
              )
            }
          />
        ))}
      </div>

      {/* PUT / DELETE */}
      <div
        style={{
          fontSize: 12,
          color: "#888",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        PUT / DELETE
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          ["PUT /api/data", "PUT", "/api/data"],
          ["DELETE /api/data", "DELETE", "/api/data"],
        ].map(([label, method, path]) => (
          <Btn
            key={label}
            label={label}
            loading={loading}
            onClick={() =>
              run(label, () =>
                doFetch(label, baseUrl + path, {
                  method,
                  headers: { "Content-Type": "application/json" },
                  body: reqBody,
                })
              )
            }
          />
        ))}
      </div>

      {/* Custom Headers */}
      <div
        style={{
          fontSize: 12,
          color: "#888",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Custom Headers
      </div>
      <div style={{ marginBottom: 12 }}>
        <textarea
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
          rows={4}
          placeholder="Name: value"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #444",
            background: "#1e1e1e",
            color: "#e0e0e0",
            fontSize: 13,
            fontFamily: "monospace",
            outline: "none",
            resize: "vertical",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <Btn
          label="GET with headers"
          loading={loading}
          onClick={() =>
            run("GET + headers", () =>
              doFetch("GET + headers", baseUrl + "/api/health", { headers: headerObj })
            )
          }
        />
        <Btn
          label="POST with headers"
          loading={loading}
          onClick={() =>
            run("POST + headers", () =>
              doFetch("POST + headers", baseUrl + "/api/echo", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...headerObj },
                body: reqBody,
              })
            )
          }
        />
      </div>

      {/* External */}
      <div
        style={{
          fontSize: 12,
          color: "#888",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        External
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          ["httpbin GET", "https://httpbin.org/get"],
          ["httpbin POST", "https://httpbin.org/post"],
        ].map(([label, url]) => (
          <Btn
            key={label}
            label={label}
            loading={loading}
            onClick={() =>
              run(label, () =>
                doFetch(
                  label,
                  url,
                  label.includes("POST")
                    ? { method: "POST", body: reqBody }
                    : undefined
                )
              )
            }
          />
        ))}
      </div>

      {/* Echo headers */}
      <div
        style={{
          fontSize: 12,
          color: "#888",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Echo Headers
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <Btn
          label="httpbin/headers"
          loading={loading}
          onClick={() =>
            run("httpbin/headers", () =>
              doFetch("httpbin/headers", "https://httpbin.org/headers", { headers: headerObj })
            )
          }
        />
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          <div
            style={{
              fontSize: 12,
              color: "#888",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Results
          </div>
          {results.map((r) => (
            <div
              key={r.id}
              style={{
                padding: "12px 16px",
                marginBottom: 8,
                borderRadius: 8,
                background: r.ok ? "#0d3320" : "#3b1515",
                borderLeft: `4px solid ${r.ok ? "#34a853" : "#ea4335"}`,
                fontSize: 13,
                wordBreak: "break-all",
              }}
            >
              <div
                style={{ fontWeight: 600, marginBottom: 4, color: "#e0e0e0" }}
              >
                {r.label}{" "}
                <span style={{ color: "#666", fontWeight: 400 }}>
                  ({r.time}ms)
                </span>
              </div>
              <pre
                style={{
                  margin: 0,
                  color: r.ok ? "#5dbe7e" : "#f28b82",
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                  fontSize: 12,
                }}
              >
                {r.message}
              </pre>
            </div>
          ))}
        </>
      )}
    </main>
  );
}

function Btn({
  label,
  loading,
  onClick,
}: {
  label: string;
  loading: string | null;
  onClick: () => void;
}) {
  const busy = loading === label;
  return (
    <button
      onClick={onClick}
      disabled={busy}
      style={{
        padding: "8px 16px",
        borderRadius: 6,
        border: "1px solid #444",
        background: busy ? "#333" : "#1e1e1e",
        color: busy ? "#888" : "#e0e0e0",
        fontSize: 13,
        cursor: busy ? "wait" : "pointer",
      }}
    >
      {busy ? "..." : label}
    </button>
  );
}

export default App;

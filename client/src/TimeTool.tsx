import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface EconomicsItem {
  event_name: string;
  date: string;
  time: string;
  country: string;
  importance: number;
}

function TimeTool() {
  const [time, setTime] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [economics, setEconomics] = useState<EconomicsItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const timestamp: number = await invoke("fetch_akamai_timestamp");
        setTime(timestamp);
      } catch (e) {
        setError(String(e));
      }
      try {
        const data: EconomicsItem[] = await invoke("fetch_usa_economics");
        setEconomics(data);
      } catch (_) {}
    })();
  }, []);

  useEffect(() => {
    if (time === null) return;
    const interval = setInterval(() => {
      setTime((t) => (t ?? 0) + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [time]);

  const formatTime = (ts: number) => {
    return new Date(ts * 1000).toLocaleTimeString();
  };

  return (
    <main style={mainStyle}>
      {error ? (
        <div style={errorStyle}>{error}</div>
      ) : time !== null ? (
        <div style={timeStyle}>{formatTime(time)}</div>
      ) : (
        <div style={loadingStyle}>Loading...</div>
      )}

      {economics.length > 0 && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Event</th>
            </tr>
          </thead>
          <tbody>
            {economics.map((item, i) => (
              <tr key={i}>
                <td style={tdStyle}>{item.time || item.date}</td>
                <td style={tdStyle}>{item.event_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  height: "100vh",
  padding: "5px 20px",
};

const timeStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  color: "#4fc3f7",
  marginBottom: 16,
};

const errorStyle: React.CSSProperties = {
  color: "#f28b82",
  fontSize: 14,
};

const loadingStyle: React.CSSProperties = {
  color: "#888",
  fontSize: 14,
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 12,
  color: "#ccc",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "4px 6px",
  borderBottom: "1px solid #444",
  color: "#888",
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: "4px 6px",
  borderBottom: "1px solid #333",
  verticalAlign: "top",
};

export default TimeTool;

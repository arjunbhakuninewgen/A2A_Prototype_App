import React, { useState, useEffect } from "react";

export default function A2ADashboard() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState("Checking...");

  // Check server health on mount
  useEffect(() => {
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    console.log("🔍 Checking server health...");
    try {
      const res = await fetch("http://127.0.0.1:8100/health", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        console.log("✅ Server is healthy:", data);
        setServerStatus("Connected ✅");
      }
    } catch (err) {
      console.error("❌ Server health check failed:", err);
      setServerStatus("Offline ❌");
    }
  };

  const sendQuery = async () => {
    if (!query.trim()) {
      console.warn("⚠️ Query is empty");
      return;
    }

    console.log("📤 Sending query:", query);
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const formData = new URLSearchParams();
      formData.append("query", query);

      console.log("📡 Request payload:", formData.toString());

      const res = await fetch("http://127.0.0.1:8100/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      console.log("📥 Response status:", res.status);
      console.log("📥 Response headers:", res.headers);

      const data = await res.json();
      console.log("📥 Response data:", data);

      if (!res.ok) {
        console.error("❌ Server error:", data);
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      console.log("✅ Success! Result:", data.result);
      setResponse(data);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError(err.message || "Failed to reach A2A orchestrator");
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      console.log("⌨️ Enter key pressed");
      sendQuery();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 75%, #4facfe 100%)",
        backgroundAttachment: "fixed",
        padding: "2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
        }}
      >
        {/* Status Bar */}
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            background: serverStatus.includes("✅") ? "rgba(76, 175, 80, 0.2)" : "rgba(244, 67, 54, 0.2)",
            border: serverStatus.includes("✅") ? "1px solid #4caf50" : "1px solid #f44336",
            color: serverStatus.includes("✅") ? "#2e7d32" : "#c62828",
            fontSize: "0.9rem",
            fontWeight: "600",
          }}
        >
          Server Status: {serverStatus}
        </div>

        {/* Main Container */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
            padding: "2.5rem",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                fontSize: "3rem",
                fontWeight: "800",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "0.5rem",
              }}
            >
              🏦 A2A Banking AI
            </div>
            <p
              style={{
                fontSize: "1.1rem",
                color: "#666",
                fontWeight: "500",
              }}
            >
              Intelligent Agent-to-Agent Banking Assistant
            </p>
            <p
              style={{
                fontSize: "0.95rem",
                color: "#999",
                marginTop: "0.5rem",
              }}
            >
              Ask about spending, trips, investments & more
            </p>
          </div>

          {/* Input Section */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "#333",
                marginBottom: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              What can we help you with?
            </label>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
              }}
            >
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  console.log("📝 Query updated:", e.target.value);
                }}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Show spending for user_123"
                style={{
                  flex: 1,
                  padding: "1rem 1.5rem",
                  borderRadius: "12px",
                  border: "2px solid #e0e0e0",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                  transition: "all 0.3s ease",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                  console.log("🔍 Input focused");
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e0e0e0";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                onClick={sendQuery}
                disabled={loading || !query.trim()}
                style={{
                  padding: "1rem 1.5rem",
                  borderRadius: "12px",
                  border: "none",
                  background: loading
                    ? "linear-gradient(135deg, #999, #bbb)"
                    : "linear-gradient(135deg, #667eea, #764ba2)",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: loading || !query.trim() ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  opacity: loading || !query.trim() ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading && query.trim()) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 10px 20px rgba(102, 126, 234, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                {loading ? (
                  <>
                    <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>
                      ⏳
                    </span>
                    Processing
                  </>
                ) : (
                  <>
                    ➤ Send
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                marginBottom: "1.5rem",
                padding: "1rem",
                borderRadius: "12px",
                background: "#fee",
                border: "1px solid #fcc",
                display: "flex",
                gap: "0.75rem",
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>⚠️</span>
              <div>
                <div style={{ fontWeight: "600", color: "#d32f2f" }}>Error</div>
                <div style={{ fontSize: "0.95rem", color: "#c62828", marginTop: "0.25rem" }}>{error}</div>
                <div style={{ fontSize: "0.85rem", color: "#999", marginTop: "0.5rem" }}>
                  💡 Check browser console (F12) for detailed error logs
                </div>
              </div>
            </div>
          )}

          {/* Response Card */}
          {response && !error && (
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1.5rem",
                borderRadius: "12px",
                background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))",
                border: "1px solid rgba(102, 126, 234, 0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>✅</span>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#333", margin: 0 }}>
                  Response
                </h2>
              </div>
              <pre
                style={{
                  background: "rgba(0, 0, 0, 0.85)",
                  color: "#00ff00",
                  padding: "1rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: "400px",
                  overflowY: "auto",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}

          {/* Suggestions */}
          {!response && !loading && (
            <div style={{ marginTop: "2rem" }}>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#999",
                  marginBottom: "1rem",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                💡 Try asking:
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                {[
                  "📊 Show spending for user_123",
                  "✈️ Plan trip Bangalore to Goa 5 days 50000",
                  "💰 Invest 100000 medium risk",
                  "🏪 Spending for user_456",
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      console.log("💡 Suggestion clicked:", suggestion);
                      setQuery(suggestion);
                    }}
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      background: "#f5f5f5",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      color: "#333",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "linear-gradient(135deg, #667eea, #764ba2)";
                      e.target.style.color = "white";
                      e.target.style.borderColor = "transparent";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#f5f5f5";
                      e.target.style.color = "#333";
                      e.target.style.borderColor = "#ddd";
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            background: "rgba(0, 0, 0, 0.3)",
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "0.8rem",
            fontFamily: "'Courier New', monospace",
          }}
        >
          🔧 Debug: Open Browser Console (F12) to see detailed logs
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
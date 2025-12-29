import React, { useState, useRef, useEffect } from "react";
import type { ChatResponse, Property, Business, Guest, Stay } from "./types";
import {
  defaultProperty,
  defaultBusiness,
  defaultGuest,
  defaultStay,
  generateSessionId,
  testMessages,
} from "./defaults";
import "./App.css";

function App() {
  const [sessionId, setSessionId] = useState(generateSessionId());
  const [messages, setMessages] = useState<ChatResponse["messages"]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [lastAgentResponse, setLastAgentResponse] = useState<
    ChatResponse["agent"] | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  // Context state
  const [guest, setGuest] = useState<Guest>(defaultGuest);
  const [stay, setStay] = useState<Stay>(defaultStay);
  const [property, setProperty] = useState<Property>(defaultProperty);
  const [business] = useState<Business>(defaultBusiness);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message,
          guest,
          stay,
          property,
          business,
        }),
      });

      if (!response.ok) {
        // Try to parse as JSON first, fall back to text
        const contentType = response.headers.get("content-type");
        let errorMessage = `Request failed with status ${response.status}`;

        if (contentType?.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.details || errorData.error || errorMessage;
          } catch {
            errorMessage = await response.text();
          }
        } else {
          const textError = await response.text();
          if (textError.includes("NOT_FOUND") || textError.includes("404")) {
            errorMessage =
              "API endpoint not found. Please check your deployment configuration.";
          } else {
            errorMessage = textError.substring(0, 200);
          }
        }
        throw new Error(errorMessage);
      }

      const data: ChatResponse = await response.json();
      setMessages(data.messages);
      setLastAgentResponse(data.agent);
      setInputMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleTestMessage = (msg: string) => {
    setInputMessage(msg);
    sendMessage(msg);
  };

  const handleNewSession = () => {
    const newId = generateSessionId();
    setSessionId(newId);
    setMessages([]);
    setLastAgentResponse(null);
    setError(null);
  };

  const handleReset = async () => {
    try {
      const response = await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = `Reset failed with status ${response.status}`;

        if (contentType?.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.details || errorData.error || errorMessage;
          } catch {
            errorMessage = await response.text();
          }
        }
        console.error("Reset error:", errorMessage);
        setError(errorMessage);
        return;
      }

      setMessages([]);
      setLastAgentResponse(null);
      setError(null);
    } catch (err) {
      console.error("Reset error:", err);
      setError(err instanceof Error ? err.message : "Reset failed");
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🏨 Nelson AI - Hospitality Agent</h1>
        <div className="header-controls">
          <label>
            <input
              type="checkbox"
              checked={showDebug}
              onChange={(e) => setShowDebug(e.target.checked)}
            />
            Show Debug
          </label>
        </div>
      </header>

      <div className="main-container">
        {/* Left Panel - Context */}
        <div className="left-panel">
          <div className="panel-section">
            <h3>Session</h3>
            <input
              type="text"
              value={sessionId}
              readOnly
              className="session-input"
            />
            <div className="button-group">
              <button onClick={handleNewSession} className="btn-secondary">
                New Session
              </button>
              <button onClick={handleReset} className="btn-secondary">
                Reset
              </button>
            </div>
          </div>

          <div className="panel-section">
            <h3>Guest</h3>
            <label>
              Name:
              <input
                type="text"
                value={guest.name}
                onChange={(e) => setGuest({ ...guest, name: e.target.value })}
              />
            </label>
            <label>
              Language Hint:
              <input
                type="text"
                value={guest.languageHint || ""}
                onChange={(e) =>
                  setGuest({ ...guest, languageHint: e.target.value })
                }
                placeholder="e.g., en, es, fr"
              />
            </label>
          </div>

          <div className="panel-section">
            <h3>Stay</h3>
            <label>
              Check-in:
              <input
                type="date"
                value={stay.checkInDate}
                onChange={(e) =>
                  setStay({ ...stay, checkInDate: e.target.value })
                }
              />
            </label>
            <label>
              Check-out:
              <input
                type="date"
                value={stay.checkOutDate}
                onChange={(e) =>
                  setStay({ ...stay, checkOutDate: e.target.value })
                }
              />
            </label>
            <label>
              Guests:
              <input
                type="number"
                value={stay.nGuests}
                onChange={(e) =>
                  setStay({ ...stay, nGuests: parseInt(e.target.value) })
                }
                min="1"
              />
            </label>
          </div>

          <details className="panel-section">
            <summary>
              <h3>Property Info</h3>
            </summary>
            <label>
              Name:
              <input
                type="text"
                value={property.name}
                onChange={(e) =>
                  setProperty({ ...property, name: e.target.value })
                }
              />
            </label>
            <label>
              Amenities:
              <textarea
                value={property.amenities}
                onChange={(e) =>
                  setProperty({ ...property, amenities: e.target.value })
                }
                rows={3}
              />
            </label>
            <label>
              FAQ:
              <textarea
                value={property.faq}
                onChange={(e) =>
                  setProperty({ ...property, faq: e.target.value })
                }
                rows={4}
              />
            </label>
          </details>
        </div>

        {/* Main Panel - Chat */}
        <div className="chat-panel">
          {error && <div className="error-banner">❌ {error}</div>}

          <div className="messages-container">
            {messages.length === 0 && (
              <div className="empty-state">
                <h2>👋 Welcome!</h2>
                <p>Try one of the test messages below or type your own.</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-header">
                  <strong>
                    {msg.role === "guest" ? "👤 Guest" : "🤖 Agent"}
                  </strong>
                  <span className="message-time">
                    {new Date(msg.ts).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-text">{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className="message agent">
                <div className="message-header">
                  <strong>🤖 Agent</strong>
                </div>
                <div className="message-text typing">Typing...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="test-buttons">
            {testMessages.map((msg, idx) => (
              <button
                key={idx}
                onClick={() => handleTestMessage(msg)}
                disabled={loading}
                className="btn-test"
              >
                {msg}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={loading}
              className="message-input"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="btn-send"
            >
              Send
            </button>
          </form>

          {showDebug && lastAgentResponse && (
            <div className="debug-panel">
              <h4>🔍 Debug Info</h4>
              <div className="debug-grid">
                <div>
                  <strong>Intent:</strong>{" "}
                  {lastAgentResponse.internal.detectedIntent}
                </div>
                <div>
                  <strong>Sentiment:</strong>{" "}
                  {lastAgentResponse.internal.sentiment}
                </div>
                <div>
                  <strong>Confidence:</strong>{" "}
                  {(lastAgentResponse.confidence * 100).toFixed(0)}%
                </div>
                <div>
                  <strong>Language:</strong> {lastAgentResponse.language}
                </div>
                <div className="debug-full">
                  <strong>Escalate:</strong>{" "}
                  <span
                    className={
                      lastAgentResponse.escalate
                        ? "escalate-yes"
                        : "escalate-no"
                    }
                  >
                    {lastAgentResponse.escalate ? "⚠️ YES" : "✅ NO"}
                  </span>
                  {lastAgentResponse.escalationReason && (
                    <span> - {lastAgentResponse.escalationReason}</span>
                  )}
                </div>
                {lastAgentResponse.upsell && (
                  <div className="debug-full upsell-info">
                    <strong>💰 Upsell:</strong> {lastAgentResponse.upsell.title}{" "}
                    ({lastAgentResponse.upsell.price}{" "}
                    {lastAgentResponse.upsell.currency})
                    <br />
                    <em>{lastAgentResponse.upsell.pitch}</em>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

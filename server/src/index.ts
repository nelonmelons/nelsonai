import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ChatRequestSchema, ChatResponseSchema } from "./schema.js";
import { HospitalityAgent } from "./agent.js";
import { sessionStore } from "./session.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize agent
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

let agent: HospitalityAgent | null = null;

if (GEMINI_API_KEY) {
  agent = new HospitalityAgent(GEMINI_API_KEY, GEMINI_MODEL);
} else {
  console.error("❌ GEMINI_API_KEY not found in environment variables");
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: agent ? "ok" : "error",
    model: GEMINI_MODEL,
    configured: !!GEMINI_API_KEY,
  });
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    // Check if agent is initialized
    if (!agent) {
      return res.status(503).json({
        error: "Service unavailable",
        details:
          "AI agent not configured. Please check GEMINI_API_KEY environment variable.",
      });
    }

    // Validate request
    const request = ChatRequestSchema.parse(req.body);

    // Get session and message history
    const messageHistory = sessionStore.getMessageHistory(request.sessionId);

    // Update context
    sessionStore.updateContext(request.sessionId, {
      guest: request.guest,
      stay: request.stay,
      property: request.property,
      business: request.business,
    });

    // Add guest message
    const guestMessage = {
      role: "guest" as const,
      text: request.message,
      ts: Date.now(),
    };
    sessionStore.addMessage(request.sessionId, guestMessage);

    // Process with agent
    const agentResponse = await agent.processMessage(request, messageHistory);

    // Add agent message
    const agentMessage = {
      role: "agent" as const,
      text: agentResponse.reply,
      ts: Date.now(),
    };
    sessionStore.addMessage(request.sessionId, agentMessage);

    // Get all messages
    const session = sessionStore.getSession(request.sessionId);

    // Build response
    const response = {
      sessionId: request.sessionId,
      agent: agentResponse,
      messages: session.messages,
    };

    // Validate response
    const validatedResponse = ChatResponseSchema.parse(response);

    res.json(validatedResponse);
  } catch (error) {
    console.error("Error processing chat:", error);
    res.status(400).json({
      error: "Failed to process message",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Reset session endpoint
app.post("/api/reset", (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId required" });
    }

    sessionStore.resetSession(sessionId);
    res.json({ success: true, sessionId });
  } catch (error) {
    res.status(500).json({ error: "Failed to reset session" });
  }
});

// Start server (for local development only)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Besty AI Server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}/api/chat`);
    console.log(`🤖 Using model: ${GEMINI_MODEL}`);
  });
}

// Export for Vercel serverless
export default app;

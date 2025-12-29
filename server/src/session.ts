import type { Message, ChatRequest } from "./schema.js";

interface Session {
  messages: Message[];
  context: {
    guest: ChatRequest["guest"];
    stay: ChatRequest["stay"];
    property: ChatRequest["property"];
    business: ChatRequest["business"];
  } | null;
}

class SessionStore {
  private sessions: Map<string, Session> = new Map();

  getSession(sessionId: string): Session {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        messages: [],
        context: null,
      });
    }
    return this.sessions.get(sessionId)!;
  }

  addMessage(sessionId: string, message: Message): void {
    const session = this.getSession(sessionId);
    session.messages.push(message);
  }

  updateContext(sessionId: string, context: Session["context"]): void {
    const session = this.getSession(sessionId);
    session.context = context;
  }

  resetSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  getMessageHistory(sessionId: string): string[] {
    const session = this.getSession(sessionId);
    return session.messages.map((m) => `${m.role.toUpperCase()}: ${m.text}`);
  }
}

export const sessionStore = new SessionStore();

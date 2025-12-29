export interface Upsell {
  id: string;
  title: string;
  price: number;
  currency: string;
  notes?: string;
}

export interface Guest {
  name: string;
  languageHint?: string | null;
}

export interface Stay {
  checkInDate: string;
  checkOutDate: string;
  nGuests: number;
}

export interface Property {
  name: string;
  timezone: string;
  houseRules: string;
  checkInInstructions: string;
  checkOutInstructions: string;
  amenities: string;
  faq: string;
}

export interface Business {
  brandVoice: string;
  allowedUpsells: Upsell[];
  upsellPolicy: string;
  escalationPolicy: string;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  guest: Guest;
  stay: Stay;
  property: Property;
  business: Business;
}

export interface AgentUpsell {
  id: string;
  title: string;
  price: number;
  currency: string;
  pitch: string;
}

export interface AgentInternal {
  detectedIntent: string;
  sentiment: string;
  missingInfo: string[];
}

export interface AgentResponse {
  reply: string;
  language: string;
  confidence: number;
  escalate: boolean;
  escalationReason: string | null;
  upsell: AgentUpsell | null;
  delaySeconds: number;
  internal: AgentInternal;
}

export interface Message {
  role: "guest" | "agent";
  text: string;
  ts: number;
}

export interface ChatResponse {
  sessionId: string;
  agent: AgentResponse;
  messages: Message[];
}

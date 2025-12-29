import { z } from "zod";

export const UpsellSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number(),
  currency: z.string(),
  notes: z.string().optional().default(""),
});

export const GuestSchema = z.object({
  name: z.string(),
  languageHint: z.string().nullable().optional(),
});

export const StaySchema = z.object({
  checkInDate: z.string(),
  checkOutDate: z.string(),
  nGuests: z.number(),
});

export const PropertySchema = z.object({
  name: z.string(),
  timezone: z.string(),
  houseRules: z.string(),
  checkInInstructions: z.string(),
  checkOutInstructions: z.string(),
  amenities: z.string(),
  faq: z.string(),
});

export const BusinessSchema = z.object({
  brandVoice: z.string(),
  allowedUpsells: z.array(UpsellSchema),
  upsellPolicy: z.string(),
  escalationPolicy: z.string(),
});

export const ChatRequestSchema = z.object({
  sessionId: z.string(),
  message: z.string(),
  guest: GuestSchema,
  stay: StaySchema,
  property: PropertySchema,
  business: BusinessSchema,
});

export const AgentUpsellSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    price: z.number(),
    currency: z.string(),
    pitch: z.string(),
  })
  .nullable();

export const AgentInternalSchema = z.object({
  detectedIntent: z.string(),
  sentiment: z.string(),
  missingInfo: z.array(z.string()),
});

export const AgentResponseSchema = z.object({
  reply: z.string(),
  language: z.string(),
  confidence: z.number(),
  escalate: z.boolean(),
  escalationReason: z.string().nullable(),
  upsell: AgentUpsellSchema,
  delaySeconds: z.number(),
  internal: AgentInternalSchema,
});

export const MessageSchema = z.object({
  role: z.enum(["guest", "agent"]),
  text: z.string(),
  ts: z.number(),
});

export const ChatResponseSchema = z.object({
  sessionId: z.string(),
  agent: AgentResponseSchema,
  messages: z.array(MessageSchema),
});

export type Upsell = z.infer<typeof UpsellSchema>;
export type Guest = z.infer<typeof GuestSchema>;
export type Stay = z.infer<typeof StaySchema>;
export type Property = z.infer<typeof PropertySchema>;
export type Business = z.infer<typeof BusinessSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type AgentUpsell = z.infer<typeof AgentUpsellSchema>;
export type AgentInternal = z.infer<typeof AgentInternalSchema>;
export type AgentResponse = z.infer<typeof AgentResponseSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

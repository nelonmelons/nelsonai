import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatRequest, AgentResponse } from "./schema.js";

const SENSITIVE_KEYWORDS = [
  "fire",
  "police",
  "emergency",
  "assault",
  "threatened",
  "refund dispute",
  "chargeback",
  "discrimination",
  "harassment",
  "lockout",
  "locked out",
  "medical emergency",
  "ambulance",
  "danger",
  "unsafe",
  "illegal",
];

export class HospitalityAgent {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-2.5-flash-lite") {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async processMessage(
    request: ChatRequest,
    messageHistory: string[]
  ): Promise<AgentResponse> {
    // Safety check first
    const safetyCheck = this.checkSafety(request.message);
    if (safetyCheck.shouldEscalate) {
      return this.createEscalationResponse(
        request,
        safetyCheck.reason || "Safety concern"
      );
    }

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(request);
    const userPrompt = this.buildUserPrompt(request, messageHistory);

    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: systemPrompt + "\n\n" + userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      const responseText = result.response.text();

      // Extract JSON from response
      const agentResponse = this.extractAndValidateJSON(responseText);

      // Post-process
      agentResponse.delaySeconds = Math.min(
        Math.max(agentResponse.delaySeconds, 0),
        120
      );

      return agentResponse;
    } catch (error) {
      console.error("Agent error:", error);
      return this.createFallbackResponse(request);
    }
  }

  private checkSafety(message: string): {
    shouldEscalate: boolean;
    reason: string | null;
  } {
    const lowerMessage = message.toLowerCase();

    for (const keyword of SENSITIVE_KEYWORDS) {
      if (lowerMessage.includes(keyword)) {
        return {
          shouldEscalate: true,
          reason: `Sensitive topic detected: ${keyword}`,
        };
      }
    }

    return { shouldEscalate: false, reason: null };
  }

  private buildSystemPrompt(request: ChatRequest): string {
    return `You are an AI guest messaging agent for ${
      request.property.name
    }, a hospitality property.

YOUR ROLE:
- Answer guest questions professionally using property information
- Use the brand voice: ${request.business.brandVoice}
- Communicate in the guest's language (or use languageHint: ${
      request.guest.languageHint || "English"
    })
- Suggest relevant upsells when appropriate (but NEVER during complaints/emergencies)
- Escalate to human staff when needed

PROPERTY INFORMATION:
- Check-in: ${request.stay.checkInDate} (Instructions: ${
      request.property.checkInInstructions
    })
- Check-out: ${request.stay.checkOutDate} (Instructions: ${
      request.property.checkOutInstructions
    })
- House Rules: ${request.property.houseRules}
- Amenities: ${request.property.amenities}
- FAQ: ${request.property.faq}

AVAILABLE UPSELLS:
${request.business.allowedUpsells
  .map(
    (u) =>
      `- ${u.title}: ${u.price} ${u.currency} ${u.notes ? `(${u.notes})` : ""}`
  )
  .join("\n")}

UPSELL POLICY: ${request.business.upsellPolicy}

ESCALATION POLICY: ${request.business.escalationPolicy}

ESCALATION TRIGGERS (must escalate=true):
- Low confidence in answer
- Refund requests or payment disputes
- Safety/security concerns
- Medical emergencies
- Threats or harassment
- Lockouts after hours
- Legal issues
- Anything you cannot handle

OUTPUT FORMAT (STRICT JSON):
{
  "reply": "your helpful response to the guest",
  "language": "detected/used language code (e.g., 'en', 'es', 'fr')",
  "confidence": 0.0-1.0,
  "escalate": false or true,
  "escalationReason": null or "brief reason",
  "upsell": null or {
    "id": "upsell_id",
    "title": "upsell title",
    "price": number,
    "currency": "USD",
    "pitch": "brief pitch why guest should get this"
  },
  "delaySeconds": 1-15,
  "internal": {
    "detectedIntent": "brief intent classification",
    "sentiment": "positive/neutral/negative/urgent",
    "missingInfo": ["list", "of", "missing", "info"]
  }
}

RULES:
- ALWAYS output valid JSON only, no other text
- Be warm, helpful, and professional
- Never upsell during complaints or emergencies
- Escalate when uncertain
- Keep replies concise (2-4 sentences usually)`;
  }

  private buildUserPrompt(
    request: ChatRequest,
    messageHistory: string[]
  ): string {
    let prompt = `GUEST: ${request.guest.name}\nNUMBER OF GUESTS: ${request.stay.nGuests}\n\n`;

    if (messageHistory.length > 0) {
      prompt += "CONVERSATION HISTORY:\n" + messageHistory.join("\n") + "\n\n";
    }

    prompt += `GUEST MESSAGE: "${request.message}"\n\nRespond with ONLY valid JSON following the exact schema above.`;

    return prompt;
  }

  private extractAndValidateJSON(text: string): AgentResponse {
    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const jsonStr = jsonMatch[0];
    const parsed = JSON.parse(jsonStr);

    // Validate required fields
    return {
      reply:
        parsed.reply ||
        "I'm here to help! Could you please rephrase your question?",
      language: parsed.language || "en",
      confidence: Math.min(Math.max(parsed.confidence || 0.7, 0), 1),
      escalate: parsed.escalate || false,
      escalationReason: parsed.escalationReason || null,
      upsell: parsed.upsell || null,
      delaySeconds: parsed.delaySeconds || 3,
      internal: {
        detectedIntent: parsed.internal?.detectedIntent || "general_inquiry",
        sentiment: parsed.internal?.sentiment || "neutral",
        missingInfo: parsed.internal?.missingInfo || [],
      },
    };
  }

  private createEscalationResponse(
    request: ChatRequest,
    reason: string
  ): AgentResponse {
    const isEmergency =
      request.message.toLowerCase().includes("emergency") ||
      request.message.toLowerCase().includes("fire") ||
      request.message.toLowerCase().includes("medical");

    return {
      reply: isEmergency
        ? "I understand this is urgent. Please call emergency services (911) immediately if needed. I'm also notifying our staff right away to assist you."
        : "Thank you for reaching out. I'm connecting you with our staff who will assist you personally. They'll respond shortly.",
      language: request.guest.languageHint || "en",
      confidence: 1.0,
      escalate: true,
      escalationReason: reason,
      upsell: null,
      delaySeconds: 1,
      internal: {
        detectedIntent: "escalation_required",
        sentiment: "urgent",
        missingInfo: [],
      },
    };
  }

  private createFallbackResponse(request: ChatRequest): AgentResponse {
    return {
      reply: `Thank you for your message, ${request.guest.name}. I want to make sure I give you accurate information. Let me connect you with our team who can help you right away.`,
      language: request.guest.languageHint || "en",
      confidence: 0.3,
      escalate: true,
      escalationReason: "Agent error - failed to process request",
      upsell: null,
      delaySeconds: 2,
      internal: {
        detectedIntent: "error",
        sentiment: "neutral",
        missingInfo: [],
      },
    };
  }
}

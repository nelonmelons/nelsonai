import type { ChatRequest, Property, Business, Guest, Stay } from "./types";

export const defaultProperty: Property = {
  name: "Sunset Beach Villa",
  timezone: "America/Los_Angeles",
  houseRules: "No smoking, no pets, no parties. Quiet hours 10pm-8am.",
  checkInInstructions:
    "Check-in is at 3:00 PM. Use keyless entry code sent via SMS. Park in spot #12.",
  checkOutInstructions:
    "Check-out is at 11:00 AM. Please leave keys on kitchen counter.",
  amenities:
    "Free WiFi (network: SunsetVilla, password: Beach2024), heated pool, hot tub, BBQ grill, beach access, smart TV, full kitchen",
  faq: `WiFi: Network "SunsetVilla", password "Beach2024"
Parking: Space #12
Beach: 2-minute walk, access path through gate
Trash: Bins in garage, pickup Tuesdays
AC/Heat: Nest thermostat in hallway
Checkout: 11 AM, leave keys on counter`,
};

export const defaultBusiness: Business = {
  brandVoice:
    "Friendly, helpful, and professional. Use a warm, welcoming tone. Be concise but thorough.",
  allowedUpsells: [
    {
      id: "early_checkin",
      title: "Early Check-in",
      price: 35,
      currency: "USD",
      notes: "Subject to availability",
    },
    {
      id: "late_checkout",
      title: "Late Checkout",
      price: 45,
      currency: "USD",
      notes: "Subject to availability",
    },
    {
      id: "parking",
      title: "Additional Parking Pass",
      price: 20,
      currency: "USD",
      notes: "",
    },
  ],
  upsellPolicy:
    "Offer upsells when relevant to guest request. Never upsell during complaints or emergencies. Present value clearly.",
  escalationPolicy:
    "Escalate for: refunds, safety issues, emergencies, lockouts, payment disputes, low confidence, anything sensitive.",
};

export const defaultGuest: Guest = {
  name: "Sarah Johnson",
  languageHint: "en",
};

export const defaultStay: Stay = {
  checkInDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
  checkOutDate: new Date(Date.now() + 259200000).toISOString().split("T")[0],
  nGuests: 2,
};

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const testMessages = [
  "What's the Wi-Fi password?",
  "Can I check in early?",
  "The AC is broken and it's really hot.",
  "I want a refund. This place is unacceptable.",
  "Is there parking available?",
];

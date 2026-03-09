import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function parseQuote(rawText: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract HVAC quote information from the following text. Return ONLY valid JSON.
    
    Quote Text:
    ${rawText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          customer: { type: Type.STRING, description: "Customer name or 'Unknown Customer'" },
          phone: { type: Type.STRING, description: "Phone number or null" },
          email: { type: Type.STRING, description: "Email address or null" },
          job: { type: Type.STRING, description: "HVAC job type (e.g., AC Repair, Furnace Install)" },
          amount: { type: Type.NUMBER, description: "Quote amount as a number or 0" },
          address: { type: Type.STRING, description: "Service address or null" },
          notes: { type: Type.STRING, description: "One sentence summary of the job" },
          urgency: { type: Type.STRING, description: "low, medium, or high" },
        },
        required: ["customer", "job", "amount"],
      },
    },
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    throw new Error("Failed to parse quote data.");
  }
}

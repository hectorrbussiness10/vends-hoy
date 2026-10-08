import OpenAI from "openai";

export function llm(): OpenAI | null {
  const openai = process.env.OPENAI_API_KEY;
  if (openai) return new OpenAI({ apiKey: openai });
  const gateway = process.env.AI_GATEWAY_API_KEY;
  if (gateway) {
    return new OpenAI({
      apiKey: gateway,
      baseURL: "https://ai-gateway.vercel.sh/v1",
    });
  }
  return null;
}

export function llmModel(): string {
  if (process.env.OPENAI_API_KEY) return "gpt-4o-mini";
  return "openai/gpt-4o-mini";
}

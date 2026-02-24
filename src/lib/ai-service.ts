import OpenAI from 'openai';

export const AgriBrain = {
  getClient: () => {
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) throw new Error("Missing DASHSCOPE_API_KEY in environment variables");

    return new OpenAI({
      apiKey: apiKey,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    });
  },

  /**
   * Analyze tree health from an image using Qwen-VL-Max.
   * Expected to return structured JSON data about disease and severity.
   */
  analyzeTreeHealth: async (imageUrl: string) => {
    const openai = AgriBrain.getClient();

    const prompt = "Analyze this image of a rubber tree leaf. Identify any disease (e.g., Oidium heveae) and estimate severity (0-100%). Return ONLY valid JSON: { \"diagnosis\": string, \"confidence\": number, \"severity\": number, \"remedy\": string }.";

    try {
      const response = await openai.chat.completions.create({
        model: "qwen-vl-max",
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: imageUrl } },
              { type: "text", text: prompt }
            ]
          }
        ]
      });

      const text = response.choices[0]?.message?.content ?? "";
      const normalizedText = Array.isArray(text)
        ? text.map((part) => (typeof part === "string" ? part : part.type === "text" ? part.text : "")).join("\n")
        : text;

      // Simple cleanup to find JSON block if wrapped in markdown
      const jsonMatch = normalizedText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : normalizedText;

      try {
        const data = JSON.parse(jsonStr);
        return data;
      } catch {
        console.warn("Failed to parse JSON from AI response, returning raw text", normalizedText);
        return { raw: normalizedText };
      }
    } catch (error) {
      console.error("AgriBrain Analyze Error:", error);
      throw error;
    }
  },

  /**
   * Generate a weekly agronomy report for a specific zone using Qwen-Max.
   */
  generateWeeklyReport: async (zoneId: string) => {
    const openai = AgriBrain.getClient();

    // In a real app, we would fetch real data for the zone here.
    const prompt = `Generate a weekly agronomy report for Zone ${zoneId}.
    Data: NDVI=0.4 (Low), Moisture=20% (Dry).
    Suggest irrigation and fertilizer plans.`;

    try {
      const response = await openai.chat.completions.create({
        model: "qwen-max",
        messages: [
          {
            role: "system",
            content: "You are an expert digital agronomist."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

      return {
        report: response.choices[0]?.message?.content ?? "",
        requestId: response.id
      };
    } catch (error) {
      console.error("AgriBrain Report Error:", error);
      throw error;
    }
  }
};

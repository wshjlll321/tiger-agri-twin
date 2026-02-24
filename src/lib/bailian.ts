// platform/src/lib/bailian.ts
import { Model } from 'dashscope';

// Ensure the API key is present in your .env file
const API_KEY = process.env.DASHSCOPE_API_KEY;

if (!API_KEY) {
  console.warn("DASHSCOPE_API_KEY is not set in environment variables.");
}

export const bailian = {
  /**
   * Diagnose plant disease using Qwen-VL-Max (Vision Language Model)
   * @param imageUrl The URL of the image to analyze
   * @param prompt specific instruction for diagnosis
   */
  diagnose: async (imageUrl: string, prompt: string = "Identify any plant diseases in this image and provide a diagnosis with confidence level.") => {
    try {
      const response = await Model.call({
        model: 'qwen-vl-max',
        messages: [
          {
            role: 'user',
            content: [
              { image: imageUrl },
              { text: prompt }
            ]
          }
        ],
        apiKey: API_KEY,
      });

      return {
        success: true,
        data: response.output?.text ?? "",
        requestId: response.requestId
      };
    } catch (error) {
      console.error('Error calling Qwen-VL-Max:', error);
      return {
        success: false,
        error: error
      };
    }
  },

  /**
   * Generate an agricultural report/prescription using Qwen-Max (LLM)
   * @param diagnosisText The diagnosis result to base the prescription on
   */
  prescribe: async (diagnosisText: string) => {
    try {
      const prompt = `You are an expert agricultural consultant.
      Based on the following diagnosis, provide a detailed prescription and treatment plan:
      "${diagnosisText}"

      The prescription should include:
      1. Immediate Actions
      2. Long-term Prevention
      3. Recommended Products/Methods
      `;

      const response = await Model.call({
        model: 'qwen-max',
        messages: [
          { role: 'system', content: 'You are an AI agricultural expert assistant.' },
          { role: 'user', content: prompt }
        ],
        apiKey: API_KEY,
      });

      return {
        success: true,
        data: response.output?.text ?? "",
        requestId: response.requestId
      };
    } catch (error) {
      console.error('Error calling Qwen-Max:', error);
      return {
        success: false,
        error: error
      };
    }
  }
};

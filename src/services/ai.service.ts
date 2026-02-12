import { Model } from 'dashscope';

// Ensure the API key is set in the environment variables
const API_KEY = process.env.DASHSCOPE_API_KEY;

if (!API_KEY) {
  console.warn('DASHSCOPE_API_KEY is not set in environment variables');
}

export class AIService {
  /**
   * Diagnose plant disease using Qwen-VL-Max (Vision Language Model)
   * @param imageUrl The URL of the image to analyze
   * @param prompt specific instruction for diagnosis
   */
  static async diagnoseDisease(imageUrl: string, prompt: string = "Identify any plant diseases in this image and provide a diagnosis with confidence level.") {
    try {
      // Input format for Qwen-VL models
      const input = {
        messages: [
          {
            role: 'user',
            content: [
              { image: imageUrl },
              { text: prompt }
            ]
          }
        ]
      };

      const response = await Model.call({
        model: 'qwen-vl-max',
        messages: input.messages,
        apiKey: API_KEY,
      });

      return {
        success: true,
        data: response.output.text,
        requestId: response.requestId
      };
    } catch (error) {
      console.error('Error calling Qwen-VL-Max:', error);
      return {
        success: false,
        error: error
      };
    }
  }

  /**
   * Generate an agricultural report using Qwen-Max (LLM)
   * @param data JSON data or text summary of the agricultural metrics
   * @param topic The topic of the report (e.g., "Weekly Growth Summary")
   */
  static async generateReport(data: any, topic: string) {
    try {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const prompt = `You are an expert agricultural consultant.
      Generate a professional ${topic} based on the following data:
      ${dataString}

      The report should include:
      1. Executive Summary
      2. Data Analysis
      3. Recommendations
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
        data: response.output.text,
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
}

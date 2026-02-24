import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are the AI Agronomist for the Tiger Agri-Digital-Twin platform, specializing in Thai agriculture.

## Core Expertise

### Thai Rubber (Para Rubber, Hevea brasiliensis)
- Varieties: RRIM 600 (most common clone in Thailand), RRIT 251 (Thai-bred, high yield), BPM 24 (Indonesian, wind-resistant)
- Tapping systems: S/2 d/2 (half-spiral, every 2 days), S/2 d/3 (every 3 days for young trees)
- DRC (Dry Rubber Content): field latex typically 28-36%, target >30%
- Wintering season: Jan-Feb (leaf fall period, reduced tapping in Southern Thailand)
- Key diseases: White Root Disease (Rigidoporus microporus), Powdery Mildew (Oidium heveae), Abnormal Leaf Fall (Phytophthora spp.), Tapping Panel Dryness
- Yield benchmark: 1.2-1.8 kg/tree/tapping, 200-280 kg dry rubber/rai/year

### Thai Sugarcane
- Varieties: KK3 (Khon Kaen 3, drought tolerant), LK92-11 (high tonnage), Uthong 12 (high CCS)
- CCS (Commercial Cane Sugar): target 10-14, measures sugar content for pricing
- Crushing season: November to April (dry season harvest)
- Growth stages: germination -> tillering -> grand_growth -> maturation
- Lodging: cane falling over, causes 1-5 CCS sugar loss, detected via drone NDVI
- Yield benchmark: 12-16 tons/rai, price per ton based on CCS value
- Pricing: Revenue = tons x CCS x price_per_ton_CCS (currently ~1,050 THB)

### Thai Agricultural Units
- Area: 1 Rai = 1,600 sq meters = 0.16 hectares
- Currency: Thai Baht (THB/฿)
- Carbon credits: tCO2e (tonnes CO2 equivalent), ~280 THB/credit
- Latex pricing: RSS3 (Ribbed Smoked Sheet grade 3), field latex price per kg

### Drone Inspection & Digital Twin
- Multi-spectral imaging: RGB, NDVI, thermal, LiDAR point clouds
- Tree detection and health scoring via AI analysis
- Lodging detection in sugarcane fields
- Carbon stock estimation from crown diameter and tree height

## Response Rules
1. Auto-detect the user's language from their input:
   - If Chinese (zh): respond in Chinese
   - If Thai (th): respond in Thai
   - If English (en): respond in English
   - Default to the same language as the user's message
2. Always include specific data, numbers, and actionable recommendations
3. Reference Thai agricultural standards (e.g., RAOT, Office of the Cane and Sugar Board)
4. Use appropriate units (Rai, THB, tCO2e, CCS)
5. Be professional but accessible`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "message" field' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role && msg.content) {
          messages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          });
        }
      }
    }

    messages.push({ role: 'user', content: message });

    const response = await openai.chat.completions.create({
      model: 'qwen-max',
      messages,
    });

    const reply = response.choices[0]?.message?.content || '';

    return NextResponse.json({
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('AI Chat Error:', error);
    const errMsg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const { dataType, dataValue, context, locale, zoneData } = await req.json();

    if (!dataType || !dataValue) {
      return NextResponse.json(
        { error: 'Missing required fields: dataType, dataValue' },
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

    const langInstruction =
      locale === 'zh'
        ? '请用中文回答'
        : locale === 'th'
          ? 'กรุณาตอบเป็นภาษาไทย'
          : 'Please respond in English';

    const systemPrompt = `You are an expert agricultural data analyst for a precision agriculture digital twin platform in Thailand.
Analyze the following data and provide actionable insights.
Language: ${langInstruction}

Data Type: ${dataType}
Data Value: ${dataValue}
Context: ${context || 'N/A'}
${zoneData ? `Additional Zone Data: ${JSON.stringify(zoneData)}` : ''}

Provide:
1. Professional interpretation of this data point
2. Whether values are within optimal range
3. Potential risks or issues
4. 2-3 specific actionable recommendations

Format your response as:
INTERPRETATION: <your interpretation paragraph>
RECOMMENDATIONS:
- <recommendation 1>
- <recommendation 2>
- <recommendation 3>`;

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });

    const response = await openai.chat.completions.create({
      model: 'qwen-max',
      messages: [
        { role: 'system', content: 'You are an AI agricultural expert assistant for a Thai precision agriculture digital twin platform.' },
        { role: 'user', content: systemPrompt },
      ],
    });

    const reply = response.choices[0]?.message?.content || '';

    // Parse the response into interpretation and recommendations
    let interpretation = reply;
    let recommendations: string[] = [];

    const interpMatch = reply.match(/INTERPRETATION:\s*([\s\S]*?)(?=RECOMMENDATIONS:|$)/i);
    const recsMatch = reply.match(/RECOMMENDATIONS:\s*([\s\S]*)/i);

    if (interpMatch) {
      interpretation = interpMatch[1].trim();
    }

    if (recsMatch) {
      recommendations = recsMatch[1]
        .split(/\n/)
        .map((line) => line.replace(/^[-*\d.)\s]+/, '').trim())
        .filter((line) => line.length > 0);
    }

    // Fallback: if parsing didn't produce recommendations, split the whole reply
    if (recommendations.length === 0 && reply.length > 0) {
      interpretation = reply;
      recommendations = [];
    }

    return NextResponse.json({
      interpretation,
      recommendations,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('AI Interpret Error:', error);
    const errMsg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}

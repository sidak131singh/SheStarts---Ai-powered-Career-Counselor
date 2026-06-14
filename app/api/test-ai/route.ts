import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.GOOGLE_AI_API_KEY;

  if (!key || key.startsWith('your-')) {
    return NextResponse.json({ error: 'GOOGLE_AI_API_KEY not set in .env.local' });
  }

  const keyInfo = { length: key.length, prefix: key.substring(0, 6), configured: true };

  // Try the first available model that supports generateContent
  const modelsToTry = [
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-2.5-flash-preview-05-20',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-002',
  ];

  const results: Record<string, string> = {};
  let success = false;

  for (const modelName of modelsToTry) {
    if (success) break;
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Reply with exactly: GEMINI_OK');
      results[modelName] = `SUCCESS: ${result.response.text().substring(0, 80)}`;
      success = true;
    } catch (e: unknown) {
      results[modelName] = `FAILED: ${(e as Error).message?.substring(0, 120)}`;
    }
  }

  return NextResponse.json({ keyInfo, chatTest: results });
}

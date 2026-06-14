import { NextRequest, NextResponse } from 'next/server';
import { sanitizeForPrompt } from '@/lib/utils/validators';

// ─── Key validation ──────────────────────────────────────────────────────────

function isValidGeminiKey(): boolean {
  const k = process.env.GOOGLE_AI_API_KEY;
  return !!(k && k.length > 10 && !k.startsWith('your-') && k !== 'your-google-ai-key-here');
}

function isValidAnthropicKey(): boolean {
  const k = process.env.ANTHROPIC_API_KEY;
  return !!(k && k !== 'your-anthropic-key-here' && k.startsWith('sk-ant-'));
}

// ─── System prompt ───────────────────────────────────────────────────────────

function buildSystemPrompt(userProfile: Record<string, unknown>): string {
  const pref = (userProfile?.preferences as Record<string, unknown>) ?? {};
  const exp  = (userProfile?.experience  as Record<string, unknown>) ?? {};
  const sk   = (userProfile?.skills      as Record<string, unknown>) ?? {};
  const gap  = (userProfile?.gap         as Record<string, unknown>) ?? {};
  const avail= (userProfile?.availability as Record<string, unknown>) ?? {};

  const targetPaths = ((pref.targetCareerPaths as string[]) ?? []).join(', ') || 'a professional role';
  const skills      = ((sk.currentSkills as string[]) ?? []).slice(0, 10).join(', ') || 'various skills';
  const industry    = (exp.industry as string) || '';

  return `You are Prerna, an empathetic AI career counselor for women restarting their careers at SheStarts.

CRITICAL: This user's target career path is: ${targetPaths}. 
ALL your advice, course suggestions, skill recommendations, and examples MUST be specific to ${targetPaths}.
${industry ? `Their background industry is: ${industry}.` : ''}

USER PROFILE:
- Name: ${userProfile.name ?? 'the user'}
- Last role: ${exp.lastJobTitle ?? 'Not specified'} at ${exp.lastCompany ?? 'Unknown'}
- Years of experience: ${exp.yearsOfExperience ?? 0}
- Career gap: ${gap.durationMonths ?? 0} months (reason: ${gap.reason ?? 'personal'})
- Gap activities: ${((gap.activities as string[]) ?? []).join(', ') || 'None mentioned'}
- Current skills: ${skills}
- Target career paths: ${targetPaths}
- Work preference: ${pref.workPreference ?? 'remote'} | Location: ${pref.location ?? 'India'}
- Daily study hours: ${avail.dailyStudyHours ?? 2} | Timeline: ${pref.targetTimelineMonths ?? 3} months

YOUR ROLE:
- Advisor: Answer questions about ${targetPaths} careers specifically
- Coach: Motivate and build confidence
- Planner: Break goals into actionable 30/60/90-day steps
- Resume Helper: Give resume and interview tips for ${targetPaths} roles

RULES:
1. Always give advice specific to their target: ${targetPaths}
2. Reference their actual skills (${skills}) when giving advice
3. Suggest real platforms: Coursera, LinkedIn Learning, YouTube, NPTEL, SkillUP
4. Keep responses to 2-3 paragraphs. End with a concrete next step or question.
5. Be direct, warm, and bold — not corporate and vague.
6. Never say generic things like "build your network" — say exactly HOW to do it for ${targetPaths}`;
}

// ─── Fallback ─────────────────────────────────────────────────────────────────

function getFallbackResponse(message: string, targetPath = 'your target career'): string {
  const m = message.toLowerCase();
  if (m.includes('interview') || m.includes('prepare'))
    return `For ${targetPath} interviews, use the STAR method for every behavioural question. Research the company's product/culture before the interview. Prepare 5 concrete examples from your previous experience. Practice out loud — confidence is a skill. Would you like to work through a specific interview question for ${targetPath} roles?`;
  if (m.includes('confidence') || m.includes('doubt') || m.includes('scared') || m.includes('nervous'))
    return `The self-doubt you feel is normal, but it is not the truth about your abilities. Your career break developed resilience, patience, and problem-solving under pressure — qualities that most candidates in ${targetPath} cannot demonstrate. Let us build the technical skills on top of the foundation you already have.`;
  if (m.includes('resume') || m.includes('cv') || m.includes('gap'))
    return `For a ${targetPath} resume, lead with outcomes and numbers. For your career gap, write: "Career break for personal responsibilities; continued development through [specific course or project relevant to ${targetPath}]." Tailor every bullet point to the keywords in the ${targetPath} job description. Would you like me to review a specific section?`;
  if (m.includes('salary') || m.includes('negotiate') || m.includes('pay') || m.includes('offer'))
    return `For ${targetPath} roles, research salary ranges on Glassdoor and LinkedIn Salary Insights first. When asked for your number, anchor to the upper end: "Based on my research and experience, I am targeting X to Y." Never give a single number — always a range. Never reveal your previous salary first.`;
  if (m.includes('roadmap') || m.includes('plan') || m.includes('what should i'))
    return `For ${targetPath}, your 90-day plan: Days 1-30, complete one core certification and build a small portfolio project. Days 31-60, start applying and do 3 informational interviews with people in ${targetPath} roles. Days 61-90, refine your pitch and negotiate. What part of this plan do you want to dig into?`;
  if (m.includes('skill') || m.includes('learn') || m.includes('course'))
    return `The most important skills for ${targetPath} right now are the ones listed in the top 10 job descriptions on LinkedIn. Search "${targetPath}" on LinkedIn Jobs, read 10 JDs, and highlight the skills that appear most often. Those become your priority list. Which skill from your gap analysis are you starting with?`;
  return `Great question about your ${targetPath} journey. The most important thing is to start with the skill that closes the biggest gap between where you are and where you want to be in ${targetPath}. Small, consistent daily actions compound faster than occasional large efforts. What is one thing you can do today to move toward ${targetPath}?`;
}

function sseStream(text: string): NextResponse {
  const encoder = new TextEncoder();
  const stream  = new ReadableStream({
    async start(controller) {
      const words = text.split(' ');
      for (let i = 0; i < words.length; i++) {
        const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`));
        await new Promise(r => setTimeout(r, 20));
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
      controller.close();
    },
  });
  return new NextResponse(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
  });
}

// ─── Route ───────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, messages, userProfile } = body;

    if (!userId || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const lastUserMessage = String(messages[messages.length - 1]?.content ?? '');
    const profile = userProfile ?? {};
    const systemPrompt = buildSystemPrompt(profile);
    const pref = (profile.preferences as Record<string, unknown>) ?? {};
    const targetPath = ((pref.targetCareerPaths as string[]) ?? []).join(', ') || 'your career';

    // ── 1. Google Gemini ─────────────────────────────────────────────────
    if (isValidGeminiKey()) {
      // gemini-2.5-flash confirmed working (June 2026)
      const GEMINI_MODELS = [
        'gemini-2.5-flash',
        'gemini-2.5-flash-preview-05-20',
        'gemini-2.0-flash',
        'gemini-2.0-flash-exp',
      ];

      for (const modelName of GEMINI_MODELS) {
        try {
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemPrompt,
          });

          // Build history from prior messages (exclude the last user message which we send separately).
          // CRITICAL: Gemini requires history to alternate user/model and MUST start with 'user'.
          // Filter out any leading assistant messages (e.g. the welcome message).
          const rawHistory = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: sanitizeForPrompt(String(msg.content)) }],
          }));

          // Drop leading 'model' turns so history always starts with 'user'
          let startIdx = 0;
          while (startIdx < rawHistory.length && rawHistory[startIdx].role === 'model') startIdx++;
          const history = rawHistory.slice(startIdx);

          const chat   = model.startChat({ history });
          const result = await chat.sendMessageStream(sanitizeForPrompt(lastUserMessage));

          const encoder = new TextEncoder();
          const stream  = new ReadableStream({
            async start(controller) {
              try {
                for await (const chunk of result.stream) {
                  const text = chunk.text();
                  if (text) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`));
                  }
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
                controller.close();
              } catch (streamErr) {
                console.error('[Gemini stream error]', streamErr);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: 'I had a momentary connection issue. Please try again.' })}\n\n`));
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
                controller.close();
              }
            },
          });

          return new NextResponse(stream, {
            headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
          });
        } catch (modelErr) {
          console.error(`[Gemini model ${modelName} failed]`, modelErr);
          // try next model
        }
      }
      console.error('[Gemini] All models failed');
    }

    // ── 2. Anthropic Claude ─────────────────────────────────────────────
    if (isValidAnthropicKey()) {
      try {
        const { Anthropic } = await import('@anthropic-ai/sdk');
        const client = new Anthropic();
        const formattedMessages = messages.map((msg: { role: string; content: string }) => ({
          role: msg.role as 'user' | 'assistant',
          content: sanitizeForPrompt(String(msg.content)),
        }));
        const encoder = new TextEncoder();
        const stream  = new ReadableStream({
          async start(controller) {
            try {
              const response = await client.messages.stream({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1024,
                system: systemPrompt,
                messages: formattedMessages,
              });
              for await (const chunk of response) {
                if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: chunk.delta.text })}\n\n`));
                }
              }
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
              controller.close();
            } catch (e) {
              console.error('[Anthropic stream error]', e);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
              controller.close();
            }
          },
        });
        return new NextResponse(stream, {
          headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
        });
      } catch (e) {
        console.error('[Anthropic init error]', e);
      }
    }

    // ── 3. Smart keyword fallback ────────────────────────────────────────
    return sseStream(getFallbackResponse(lastUserMessage, targetPath));

  } catch (error) {
    console.error('[Counselor stream error]', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Counselor streaming API ready',
    geminiConfigured: isValidGeminiKey(),
    anthropicConfigured: isValidAnthropicKey(),
  });
}

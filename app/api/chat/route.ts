import { NextRequest, NextResponse } from "next/server";

const XAI_CHAT_URL = "https://api.x.ai/v1/chat/completions";

/** Default fast model; override with XAI_MODEL in .env.local */
const DEFAULT_MODEL = "grok-3-mini";

export async function POST(req: NextRequest) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing XAI_API_KEY. Add it to .env.local (xAI Console)." },
      { status: 500 }
    );
  }

  try {
    const { messages, context } = await req.json();

    const systemPrompt = `You are Scholar AI, a smart academic assistant built into ScholarOS. You have full access to the student's data:

GRADES: ${JSON.stringify(context.grades, null, 2)}

ASSIGNMENTS: ${JSON.stringify(context.assignments, null, 2)}

CALENDAR: ${JSON.stringify(context.calendar, null, 2)}

EXTRACURRICULARS: ${JSON.stringify(context.extracurriculars, null, 2)}

PROJECTS: ${JSON.stringify(context.projects, null, 2)}

Use this data to answer questions accurately and give personalized strategic advice. Be concise, encouraging, and actionable.`;

    const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      })),
    ];

    const model = process.env.XAI_MODEL ?? DEFAULT_MODEL;

    const res = await fetch(XAI_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        stream: false,
      }),
    });

    const data = (await res.json()) as {
      choices?: { message?: { content?: string | null } }[];
      error?: { message?: string };
    };

    if (!res.ok) {
      const errMsg = data.error?.message ?? res.statusText;
      return NextResponse.json({ error: errMsg || "xAI request failed" }, { status: res.status });
    }

    const text = data.choices?.[0]?.message?.content;
    if (text == null || text === "") {
      return NextResponse.json({ error: "Empty response from Grok" }, { status: 502 });
    }

    return NextResponse.json({ text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    const systemPrompt = `You are Scholar AI, a smart academic assistant built into ScholarOS. You have full access to the student's data:

GRADES: ${JSON.stringify(context.grades, null, 2)}

ASSIGNMENTS: ${JSON.stringify(context.assignments, null, 2)}

CALENDAR: ${JSON.stringify(context.calendar, null, 2)}

EXTRACURRICULARS: ${JSON.stringify(context.extracurriculars, null, 2)}

PROJECTS: ${JSON.stringify(context.projects, null, 2)}

Use this data to answer questions accurately and give personalized strategic advice. Be concise, encouraging, and actionable. Format responses with markdown when helpful.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

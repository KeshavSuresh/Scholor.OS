import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    const systemPrompt = `You are Scholar AI, a smart academic assistant built into ScholarOS. You have full access to the student's data:

GRADES: ${JSON.stringify(context.grades, null, 2)}

ASSIGNMENTS: ${JSON.stringify(context.assignments, null, 2)}

CALENDAR: ${JSON.stringify(context.calendar, null, 2)}

EXTRACURRICULARS: ${JSON.stringify(context.extracurriculars, null, 2)}

PROJECTS: ${JSON.stringify(context.projects, null, 2)}

Use this data to answer questions accurately and give personalized strategic advice. Be concise, encouraging, and actionable.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
    });

    // Convert message history for Gemini (exclude the last user message)
    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();

    return NextResponse.json({ text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

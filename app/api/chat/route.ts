// app/api/chat/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, situation, config } = await req.json();

    const apiKey = config?.apiKey || process.env.OPENAI_API_KEY;
    const model = config?.model || "gpt-3.5-turbo";
    const systemPrompt = config?.systemPrompt || "Você é um assistente útil.";

    if (!apiKey) {
      return NextResponse.json({ error: "API key não fornecida" }, { status: 400 });
    }

    const openaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${situation ? situation + "\n\n" : ""}${message}` },
        ],
        max_tokens: 800,
        temperature: 0.2,
      }),
    });

    if (!openaiResp.ok) {
      const errorText = await openaiResp.text();
      return NextResponse.json({ error: errorText }, { status: openaiResp.status });
    }

    const data = await openaiResp.json();
    const text = data?.choices?.[0]?.message?.content ?? "Sem resposta";

    return NextResponse.json({ message: text, timestamp: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}

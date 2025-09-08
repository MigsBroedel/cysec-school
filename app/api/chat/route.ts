// app/api/chat/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, situation, config } = await req.json();

    const apiKey = "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";
    const model = config?.model || "deepseek/deepseek-chat-v3.1:free";
    const systemPrompt = config?.systemPrompt || "Você é um assistente útil.";

    if (!apiKey) {
      return NextResponse.json({ error: "API key não fornecida" }, { status: 400 });
    }

    // Verificar se é uma chave do OpenRouter
    if (!apiKey.startsWith('sk-or-v1-')) {
      return NextResponse.json({ 
        error: "Use uma API key do OpenRouter (começa com 'sk-or-v1-')" 
      }, { status: 400 });
    }

    console.log("Enviando requisição para OpenRouter...");
    console.log("Modelo:", model);

    const openrouterResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Cysec Chatbot",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${situation ? situation + "\n\n" : ""}${message}` },
        ],
        max_tokens: 1000,
        temperature: 0.3,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    console.log("Status da resposta:", openrouterResp.status);

    if (!openrouterResp.ok) {
      const errorText = await openrouterResp.text();
      console.error("Erro da API OpenRouter:", errorText);
      
      // Tentar parsear o erro para uma mensagem mais amigável
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json({ 
          error: errorJson.error?.message || errorText 
        }, { status: openrouterResp.status });
      } catch {
        return NextResponse.json({ 
          error: `Erro da API: ${errorText}` 
        }, { status: openrouterResp.status });
      }
    }

    const data = await openrouterResp.json();
    console.log("Resposta recebida com sucesso");
    
    const text = data?.choices?.[0]?.message?.content ?? "Sem resposta disponível";

    return NextResponse.json({ 
      message: text, 
      timestamp: new Date().toISOString(),
      model: data.model || model 
    });

  } catch (err: any) {
    console.error("Erro no servidor:", err);
    return NextResponse.json({ 
      error: `Erro interno: ${err.message}` 
    }, { status: 500 });
  }
}

import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { message, situation } = await req.json()

    const apiKey = "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"
    const model = "openai/gpt-oss-20b:free" // modelo confiável como fallback

    if (!apiKey) {
      return NextResponse.json({ error: "API key não configurada" }, { status: 400 })
    }

    const systemPrompt = `Você é o Cysec, um assistente especializado em segurança cibernética. 
Suas especialidades incluem:
- Análise de vulnerabilidades
- Prevenção de ataques cibernéticos
- Políticas de segurança
- Compliance e regulamentações
- Resposta a incidentes
- Educação em segurança
Sempre forneça respostas práticas, claras e baseadas nas melhores práticas de segurança.`

    const openrouterResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${situation ? situation + "\n\n" : ""}${message}` },
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    })

    if (!openrouterResp.ok) {
      const errorText = await openrouterResp.text()
      console.error("Erro da API OpenRouter:", errorText)
      return NextResponse.json({ error: errorText }, { status: openrouterResp.status })
    }

    const data = await openrouterResp.json()
    const text = data?.choices?.[0]?.message?.content ?? "Sem resposta disponível"

    return NextResponse.json({
      message: text,
      timestamp: new Date().toISOString(),
      model: data.model || model,
    })
  } catch (err: any) {
    console.error("Erro no servidor:", err)
    return NextResponse.json(
      { error: `Erro interno: ${err.message}` },
      { status: 500 },
    )
  }
}

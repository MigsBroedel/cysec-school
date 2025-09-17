import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { message, situation } = await req.json()

    const apiKey = process.env.OPENROUTER_API_KEY
    const model = "openai/gpt-oss-120b:free"

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
        Authorization: `Bearer ${apiKey}`,
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

      if (openrouterResp.status === 401) {
        return NextResponse.json(
          {
            error: "Erro de autenticação. A API key pode estar inválida ou expirada.",
          },
          { status: 401 },
        )
      }

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
    return NextResponse.json({ error: `Erro interno: ${err.message}` }, { status: 500 })
  }
}

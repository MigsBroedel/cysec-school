import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { message, situation } = await req.json()

    const apiKey = "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"
    const model = "deepseek/deepseek-chat-v3.1:free"
    const systemPrompt = `Você é o Cysec, um assistente especializado em segurança cibernética. 
Você ajuda empresas e indivíduos a entender e resolver questões de segurança digital.

Suas especialidades incluem:
- Análise de vulnerabilidades
- Prevenção de ataques cibernéticos
- Políticas de segurança
- Compliance e regulamentações
- Resposta a incidentes
- Educação em segurança

Sempre forneça respostas práticas, claras e baseadas nas melhores práticas de segurança.
Quando necessário, sugira ações específicas e medidas preventivas.`

    if (!apiKey) {
      return NextResponse.json({ error: "API key não fornecida" }, { status: 400 })
    }

    console.log("Enviando requisição para OpenRouter...")
    console.log("Modelo:", model)

    const openrouterResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
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
    })

    console.log("Status da resposta:", openrouterResp.status)

    if (!openrouterResp.ok) {
      const errorText = await openrouterResp.text()
      console.error("Erro da API OpenRouter:", errorText)

      try {
        const errorJson = JSON.parse(errorText)
        return NextResponse.json(
          {
            error: errorJson.error?.message || errorText,
          },
          { status: openrouterResp.status },
        )
      } catch {
        return NextResponse.json(
          {
            error: `Erro da API: ${errorText}`,
          },
          { status: openrouterResp.status },
        )
      }
    }

    const data = await openrouterResp.json()
    console.log("Resposta recebida com sucesso")

    const text = data?.choices?.[0]?.message?.content ?? "Sem resposta disponível"

    return NextResponse.json({
      message: text,
      timestamp: new Date().toISOString(),
      model: data.model || model,
    })
  } catch (err: any) {
    console.error("Erro no servidor:", err)
    return NextResponse.json(
      {
        error: `Erro interno: ${err.message}`,
      },
      { status: 500 },
    )
  }
}

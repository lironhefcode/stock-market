import { GoogleGenAI } from "@google/genai"
import { getStockMetrics } from "@/lib/actions/finnhub.actions"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

function buildSystemPrompt(stockData: StockContextData): string {
  return `You are a sharp, conversational stock market analyst helping a user research ${stockData.symbol} (${stockData.companyName}). Think of yourself as a knowledgeable friend — direct, opinionated, and curious about what the user actually needs.

LIVE DATA for ${stockData.symbol}:
Price: $${stockData.currentPrice} | Change: ${stockData.changePercent >= 0 ? "+" : ""}${stockData.changePercent}% | MCap: $${(stockData.marketCap * 1_000_000).toLocaleString()} | P/E: ${stockData.peRatio || "N/A"} | 52W Range: $${stockData.weekLow52 || "N/A"} – $${stockData.weekHigh52 || "N/A"}

STRICT RESPONSE RULES:
1. **MAX 3-5 sentences per reply.** Be punchy — no filler, no walls of text.
2. **ALWAYS end every reply with exactly ONE follow-up question** to better understand the user's goals, time horizon, risk tolerance, or what specific angle they care about. This is mandatory.
3. Use plain English. Bold only the most important numbers with **bold**.
4. Give a clear take — don't hedge everything. Mention one bullish AND one bearish signal when relevant, but keep it tight.
5. On the FIRST message only, add a one-line risk disclaimer (e.g. "Not financial advice — always do your own research.").
6. Never guarantee profits or specific price targets.
7. If asked about something unrelated to stocks/finance, briefly redirect back.
8. Do NOT repeat data the user already knows. Build on the conversation.`
}

export async function POST(request: Request) {
  try {
    const { symbol, messages }: ChatRequest = await request.json()

    if (!symbol || !messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Symbol and messages are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Fetch real-time stock data
    const { quotes, profiles, metrics } = await getStockMetrics([symbol.toUpperCase()])
    const quote = quotes[symbol.toUpperCase()]
    const profile = profiles[symbol.toUpperCase()]
    const metric = metrics[symbol.toUpperCase()]

    const stockData: StockContextData = {
      symbol: symbol.toUpperCase(),
      companyName: profile?.name || symbol.toUpperCase(),
      currentPrice: quote?.c || 0,
      changePercent: quote?.dp || 0,
      marketCap: profile?.marketCapitalization || 0,
      peRatio: metric?.metric?.peBasicExclExtraTTM ?? 0,
      weekHigh52: metric?.metric?.["52WeekHigh"] ?? 0,
      weekLow52: metric?.metric?.["52WeekLow"] ?? 0,
    }

    const systemPrompt = buildSystemPrompt(stockData)

    // Build conversation history for the API
    const conversationContents = messages.map((msg) => ({
      role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: msg.content }],
    }))

    // Stream the response
    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: conversationContents,
      config: {
        systemInstruction: systemPrompt,
      },
    })

    // Create a readable stream from the Gemini response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.text
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
          controller.close()
        } catch (error) {
          console.error("Streaming error:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to generate response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

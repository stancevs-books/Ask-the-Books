import { BOOKS } from "../books.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { bookId, messages } = req.body;

  if (!bookId || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "bookId and messages array required" });
  }

  const book = BOOKS[bookId];
  if (!book) return res.status(400).json({ error: `Unknown bookId: ${bookId}` });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  const makeRequest = async () => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: book.system,
        messages,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "API error");
    return data;
  };

  try {
    let data;
    try {
      data = await makeRequest();
    } catch (err) {
      if (err.message.includes("overload")) {
        await new Promise(r => setTimeout(r, 2000));
        data = await makeRequest();
      } else {
        throw err;
      }
    }
    const text = data.content?.map((c) => c.text || "").join("") || "";
    res.status(200).json({ answer: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

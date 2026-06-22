import OpenAI from "openai";
import "dotenv/config";
const apiKey = process.env.NVIDIA_API_KEY;
const openai = new OpenAI({
  apiKey: apiKey || "",
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export const callLlama = async (prompt) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.1-70b-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 4096,
    });

    const rawResponse = completion.choices[0].message.content;
    return rawResponse;
  } catch (error) {
    console.error(" AI API Error:", error.message || error);
    throw error;
  }
};

import { streamText, generateText } from "ai";
import { v0Model } from "../config/vercel";

export async function generateWithOptimalStreaming(
  prompt: string,
  maxTokens: number = 4000,
  useStreaming: boolean = true
) {
  if (useStreaming) {
    // Use Bun-optimized streaming for better performance
    const result = await streamText({
      model: v0Model,
      prompt,
      maxTokens,
      temperature: 0.7, // Balanced creativity
    });

    let fullText = "";
    const chunks: string[] = [];

    // Optimized streaming with backpressure handling
    for await (const textPart of result.textStream) {
      fullText += textPart;
      chunks.push(textPart);

      // Yield control to event loop every 100 chunks for better performance
      if (chunks.length % 100 === 0) {
        await new Promise((resolve) => setImmediate(resolve));
      }
    }

    return {
      text: fullText,
      usage: await result.usage,
      streamed: true,
      chunkCount: chunks.length,
    };
  } else {
    // Fallback to regular generation
    const result = await generateText({
      model: v0Model,
      prompt,
      maxTokens,
      temperature: 0.7,
    });

    return {
      text: result.text,
      usage: result.usage,
      streamed: false,
      chunkCount: 0,
    };
  }
} 
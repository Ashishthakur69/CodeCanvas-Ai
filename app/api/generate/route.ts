// app/api/generate/route.ts
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// Initialize the Gemini client using the environment variable
// It will automatically pick up the GEMINI_API_KEY from your .env.local file
const ai = new GoogleGenAI({});

// Define the system instruction to guide the model's output
const SYSTEM_INSTRUCTION = `
You are CodeCanvas AI. Your task is to act as an expert frontend engineer and convert a user's prompt (text or image description) into clean, ready-to-use HTML code with Tailwind CSS utility classes.
1. ALWAYS respond with ONLY the raw HTML code. Do not include markdown formatting (like \`\`\`html) or any conversational text.
2. Ensure the code is responsive and follows modern web design principles.
3. If an image is provided, generate the code that matches the image's appearance and layout.
4. If no code is visually obvious, generate a single component based on the text prompt.
5. Do not include <head>, <body>, or <html> tags. Only include the UI structure.
`;

export async function POST(req: Request) {
  try {
    const { prompt, base64Image } = await req.json();

    // 1. Build the Parts Array for Gemini
    const modelParts = [];

    // Add the text prompt
    modelParts.push({ text: prompt });

    // Add the image part if a base64 string is provided
    if (base64Image) {
      // Helper function to create the image part
      const imagePart = (mimeType: string, data: string) => ({
        inlineData: {
          data,
          mimeType
        },
      });

      // Simple attempt to determine MIME type from common prefixes
      let mimeType = 'image/jpeg';
      if (base64Image.startsWith('data:image/png')) {
        mimeType = 'image/png';
      } else if (base64Image.startsWith('data:image/webp')) {
        mimeType = 'image/webp';
      }
      
      const data = base64Image.split(',')[1];
      modelParts.push(imagePart(mimeType, data));
    }
    
    // 2. Call the Gemini API for Streaming
    const responseStream = await ai.models.generateContentStream({
      model: base64Image ? "gemini-2.5-flash" : "gemini-2.5-flash", // Use a multimodal model if image exists
      contents: [{ role: "user", parts: modelParts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // Set temperature lower for more deterministic code output
        temperature: 0.2, 
      }
    });

    // 3. Transform the Gemini Stream into a readable stream for Next.js
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of responseStream) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      },
    });

    // 4. Send the streaming response back to the client
    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain",
      },
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate code from AI." },
      { status: 500 }
    );
  }
}
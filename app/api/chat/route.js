require("dotenv").config({ path: ".env.local" });

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const data = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = data.prompt || "";
    const completion = await model.generateContent(prompt, { stream: true });

    const stream = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();
        try {
          let responseText = "";
          for await (const chunk of completion) {
            const content = chunk?.choices?.[0]?.content || "";
            responseText += content;
            controller.enqueue(decoder.encode(content));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new NextResponse(stream);
  } catch (error) {
    console.error("Error in API route:", error);
    return new NextResponse("Failed to generate content", { status: 500 });
  }
}

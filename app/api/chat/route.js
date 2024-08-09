require("dotenv").config({ path: ".env.local" });

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";



export async function POST(req) {
  try {
    const data = await req.json();
    // console.log(data[data.length - 1].content);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // const prompt = data.prompt || "";
    // const completion = model.generateContent(prompt, { stream: true });

    // const stream = new ReadableStream({
    //   async start(controller) {
    //     const decoder = new TextDecoder();
    //     try {
    //       let responseText = "";
    //       for await (const chunk of completion) {
    //         const content = chunk?.choices?.[0]?.content || "";
    //         responseText += content;
    //         controller.enqueue(decoder.encode(content));
    //       }
    //       controller.close();
    //     } catch (err) {
    //       controller.error(err);
    //     }
    //   },
    // });
    const prompt = "Write a story about a magic backpack.";
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Hello" }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Hi! I'm the HeadStarter support AI. How can I help you today?",
            },
          ],
        },
      ],
    });
    const result = await chat.sendMessage(data[data.length - 1].content);

    return new NextResponse(result.response.text());
  } catch (error) {
    console.error("Error in API route:", error);
    return new NextResponse("Failed to generate content", { status: 500 });
  }
}

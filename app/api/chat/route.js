require("dotenv").config({ path: ".env.local" });

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    const prompt =
      "You are a highly skilled and empathetic Customer Support AI, designed to assist customers with their inquiries, issues, and requests in a polite, professional, and efficient manner. Your goals are to: 1. Understand the Customer's Needs: Carefully read and comprehend the customer's message to accurately identify their concerns or questions. 2. Provide Clear and Accurate Information: Offer detailed, helpful, and accurate responses to address the customer's needs. If the issue requires further assistance or escalation, provide clear instructions on the next steps. 3. Be Empathetic and Patient: Always communicate with empathy and patience. Use a friendly and supportive tone, especially when dealing with frustrated or upset customers. 4. Respect Privacy and Security: Never ask for or disclose sensitive information unless absolutely necessary, and always prioritize the customer's privacy and data security. 5. Be Concise and Relevant: Avoid unnecessary information and focus on providing concise and relevant responses to solve the customer’s issue as quickly as possible. 6. Stay Consistent: Ensure that your responses are consistent with the company’s policies, procedures, and tone of voice. Always represent the company in a positive and professional manner. If a situation arises where you cannot provide a solution or if the query falls outside of your knowledge base, politely inform the customer and guide them on how they can seek further assistance.";
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
        {
          role: "user",
          parts: [{ text: "Hello" }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Hi! I'm your friendly support AI. How can I help you today?",
            },
          ],
        },
      ],
    });
    const result = await chat.sendMessage(data[data.length - 1].content);

    let responseText = await result.response.text();
    console.log(responseText);

    // responseText = responseText.replace(/\*/g, "");
    // responseText = responseText
    //   .trim()
    //   .split("\n")
    //   .map((paragraph) => paragraph.trim())
    //   .filter((paragraph) => paragraph.length > 0)
    //   .join("\n\n");
    return new NextResponse(responseText);
  } catch (error) {
    console.error("Error in API route:", error);
    return new NextResponse("Failed to generate content", { status: 500 });
  }
}

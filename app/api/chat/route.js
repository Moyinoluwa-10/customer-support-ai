import { NextResponse } from "next/server";
import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";

const systemPrompt = `You are a friendly and efficient customer support bot for HeadStarterAI, a platform specializing in AI-powered interviews for software engineering (SWE) jobs. Your primary goal is to assist users with their queries, provide information about the platform, troubleshoot issues, and ensure a smooth user experience.

1. HeadStarterAI offers AI-powered interviews for software engineering positions.
2. Our platform helps candidates practice and prepare for real job interviews.
3. We cover a wide range of topics including algorithms, data structures, system design, and behavioral questions.
4. Users can access our services through our website or mobile app.
5. If asked about technical issues, guide users to our troubleshooting page or suggest contacting our technical support team.
6. Always maintain user privacy and do not share personal information.
7. If you're unsure about any information, it's okay to say you don't know and offer to connect the user with a human representative.

Your goal is to provide accurate information, assist with common inquiries, and ensure a positive experience for all HeadStarterAI users.`;

const decoder = new TextDecoder();
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  },
});

async function* makeIterator(prompt) {
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: systemPrompt },
          { type: "text", text: prompt },
        ],
      },
    ],
  };

  const command = new InvokeModelWithResponseStreamCommand({
    modelId: "anthropic.claude-3-haiku-20240307-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
  });

  try {
    const response = await bedrockClient.send(command);
    if (response.body) {
      for await (const chunk of response.body) {
        if (chunk.chunk) {
          try {
            const json = JSON.parse(decoder.decode(chunk.chunk.bytes));
            if (json.type == "content_block_delta") {
              yield json.delta.text;
            }
          } catch (error) {
            console.log("eeror in chunk", error);
            yield " ";
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in sending prompt:", error);
    return new NextResponse("Failed to generate content", { status: 500 });
  }

  return new NextResponse("OK");
}

function iteratorToStream(iterator) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

export async function POST(req) {
  const data = await req.json();
  const iterator = makeIterator(data[data.length - 1].content);
  const stream = iteratorToStream(iterator);
  return new Response(stream);
}

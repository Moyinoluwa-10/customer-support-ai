require("dotenv").config({ path: ".env.local" });

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";



export async function POST(req) {
  try {
    // Make sure to include these imports:
// import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = "Write a story about a magic backpack.";

const result = await model.generateContent(prompt);
console.log(result.response.text());
    return new NextResponse(stream);
  } catch (error) {
    console.error("Error in API route:", error);
    return new NextResponse("Failed to generate content", { status: 500 });
  }
}

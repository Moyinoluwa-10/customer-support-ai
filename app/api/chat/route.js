import {NextResponse} from 'next/server'
import OpenAI from 'openai'

const systemPrompt = `You are a friendly and efficient customer support bot for HeadStarterAI, a platform specializing in AI-powered interviews for software engineering (SWE) jobs. Your primary goal is to assist users with their queries, provide information about the platform, troubleshoot issues, and ensure a smooth user experience.

1. HeadstarterAI offers AI-powered interviews for software engineering positions.
2. Our platform helps candidates practice and prepare for real job interviews.
3. We cover a wide range of topics including algorithims, data structures, system design, and behavioural questions.
4. Users can access our services through our website or mobie app.
5. If asked about technical issues, guide users to our troubleshooting page or suggest contacting our techical support team.
6. Always maintain user privacy and do not share personal information.
7. If youre unsure about any information, it's okay to say you don't know and offer to connect the user with a human representative.

Your goal is to provide accurate information, assist with common inquiries, and ensure a positive experience for all HeadStarterAI users.`

export async function POST(req){
    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            {
            role: 'system',
            content: systemPrompt,
            },
            ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })
    
    const stream = new ReadableStream({
        async start(controller) {
            const encoder =new TextEncoder()
            try  {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch(err) {
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })

    return new NextResponse(stream)
}



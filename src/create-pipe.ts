// Langbase Pipe agent with native memory integration.
import 'dotenv/config';
import { Langbase } from 'langbase';
import { CONFIG } from './config';

const langbase = new Langbase({
    apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
    try {
        const supportAgent = await langbase.pipes.create({
            name: CONFIG.PIPE_NAME,
            description: `An AI agent to support users with their queries.`,
            model: CONFIG.LLM_MODEL,
            memory: [{ name: CONFIG.MEMORY_NAME }], // Native memory link
            caching: true, // Enable prompt caching
            messages: [
                {
                    role: `system`,
                    content: `You're a helpful AI assistant.
                    You will assist users with their queries.
                    Always ensure that you provide accurate and to the point information.`,
                },
            ],
        });

        console.log('Support agent created successfully:', supportAgent.name);
    } catch (error) {
        console.error('Error creating pipe agent:', error);
    }
}

main();

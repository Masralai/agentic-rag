// Langbase Pipe agent which is a serverless AI agent with unified APIs for every LLM.
import 'dotenv/config';
import { Langbase } from 'langbase';

const langbase = new Langbase({
    apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
    const supportAgent = await langbase.pipes.create({
        name: `support-agent-gem`,
        description: `An AI agent to support users with their queries.`,
        model: `google:gemini-2.0-flash`,
        messages: [
            {
                role: `system`,
                content: `You're a helpful AI assistant.
                You will assist users with their queries.
                Always ensure that you provide accurate and to the point information.`,
            },
        ],
    });

    console.log('Support agent:', supportAgent);
}

main();

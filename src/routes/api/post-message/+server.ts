import { error } from '@sveltejs/kit';
import { PRIVATE_OPENAI_KEY } from "$env/static/private";
import OpenAI from "openai";

interface MessageFeed {
    role: "user" | "assistant",
	content: string
}

const openai = new OpenAI({
    apiKey: PRIVATE_OPENAI_KEY
});

export async function POST ({ request, locals: {supabase, getSession}}){
    
    const session = await getSession();
    
    const body = await request.json();
    const messages = body.messageFeed;

    if(!isMessageFeed(messages)){
        throw error(400, "Body IS not formatted correctly");
    }
    if(!session?.user){
       throw error(400, "User must be authenticated"); 
    }

    
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        user: session.user.id,
        messages: [
            {
                role: "system",
                content: "Eres un asistente que contesta preguntas sobre un condominio en específico ubicado en el Estado de México, y por tanto está apegado a la ley general de condominios. Si la pregunta necesita de un fragmento en específico del reglamento, contesta 'Necesito: {una descripción del fragmento que necesitas para contestar la pregunta}'.  El usuario le va a proporcionar como respuesta el fragmento del reglamento que pidas entre 3 comillas simples. Con este fragmento contesta la pregunta del usuario. Si la pregunta del usuario no está relacionada con condominios, contesta 'No puedo contestar eso'"
            },
            ...messages
        ]
    });

    const chatResponse = completion.choices[0].message.content;

    console.log(chatResponse);

    if(chatResponse?.startsWith("Necesito:")){
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: chatResponse
        });

        const embedding = embeddingResponse.data[0].embedding;

        const { data } = await supabase.rpc("match_documents", {
            query_embedding: embedding,
            similarity_threshold: 0.6, 
            match_count: 2
        });

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", 
            user: session.user.id,
            messages: [
                {
                    role: "system",
                    content: "Eres un asistente que contesta preguntas sobre un condominio en específico ubicado en el Estado de México, y por tanto está apegado a la ley general de condominios. Si la pregunta necesita  de un fragmento en específico del reglamento, contesta 'Necesito: {una descripción del fragmento que necesitas}'.  El usuario le va a proporcionar como respuesta el fragmento del reglamento que pidas entre 3 comillas simples. Con este fragmento contesta la pregunta del usuario. Si la pregunta del usuario no está relacionada con condominios, contesta 'No puedo contestar eso'"
                },
                ...messages,
                {
                    role: "assistant",
                    content: chatResponse
                },
                {
                    role: "user",
                    content: `'''${data[0].content}'''`
                }
            ]
        });

        return new Response(JSON.stringify({
            prompt: completion.choices[0].message.content
        }))
    }

    return new Response(JSON.stringify({ 
        prompt: completion.choices[0].message.content,
    }));
    
}

function isMessageFeed(obj: MessageFeed[]): obj is MessageFeed[]{
    return "role" in obj[0] && "content" in obj[0]; 
}
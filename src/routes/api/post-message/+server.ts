import { error } from '@sveltejs/kit';
import { PRIVATE_OPENAI_KEY } from "$env/static/private";
import OpenAI from "openai";

interface MessageFeed {
    role: "user" | "assistant",
	content: string
}
interface EmbeddingData {
    id: number,
    content: string,
    similarity: number
}

const openai = new OpenAI({
    apiKey: PRIVATE_OPENAI_KEY
});

export async function POST ({ request, locals: {supabase, getSession}}){
    
    const session = await getSession();

    const body = await request.json();
    const messages = body.messageFeed;

    if(!isMessageFeed(messages)){
        throw error(400, "Body is not formatted correctly");
    }
    if(!session?.user){
       throw error(400, "User must be authenticated"); 
    }

    const UserInformation = await supabase.from("UserInformation").select("condominium");
    const condoId = UserInformation.data ? UserInformation.data[0].condominium : null;


    const userQuestion = messages.at(-1);

    const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: userQuestion ? userQuestion.content : ""
    });
    const embedding = embeddingResponse.data[0].embedding;

    const { data } = await supabase.rpc("match_documents", {
        query_embedding: embedding,
        similarity_threshold: 0.6, 
        match_count: 2,
        condo_id: condoId
    });

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        user: session.user.id,
        stream: true,
        messages: [
            {
                role: "system",
                content: "Eres un asistente que contesta preguntas sobre un condominio en específico ubicado en el Estado de México, y por tanto está apegado a la ley general de condominios. El usuario le va a proporcionar un fragmento de texto en forma de 'pregunta-respuesta' entre 3 comillas simples. Con ayuda de este fragmento contesta la pregunta del usuario sobre el condominio. Si la pregunta del usuario no está relacionada con condominios, contesta 'No puedo contestar eso'. Sé lo más conciso posible y evita decir frases como 'según el fragmento'"
            },
            ...messages,
            {
                role: "user",
                content: `'''${data.map(embedding  => embedding.content).join(" ")}'''`
            }
        ]
    }); 

    const responseStream = new ReadableStream({
        async start(controller){
            for await (const part of completion){
                controller.enqueue(part.choices[0]?.delta?.content || '');
            }
            controller.close();
        }
    });
    
    return new Response(
        responseStream,
        {
            headers: {
                'Content-Type': "text/event-stream", 
            }
        }
    );
    
}

function isMessageFeed(obj: MessageFeed[]): obj is MessageFeed[]{
    return "role" in obj[0] && "content" in obj[0]; 
}
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
serve(async (req: Request) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}
	try {
		const request = await req.json();

		const messages = request.messageFeed;
		const condo_id = request.condo_id;

		const userQuestion = messages.at(-1);

		/* // Supabase API URL - env var exported by default.
		Deno.env.get('SUPABASE_URL') ?? '',
		// Supabase API ANON KEY - env var exported by default.
		Deno.env.get('SUPABASE_ANON_KEY') ?? '' 
		${Deno.env.get('PRIVATE_OPENAI_KEY')}*/
		// Create a Supabase client with the Auth context of the logged in user.
		const supabaseClient = createClient(
			Deno.env.get('SUPABASE_URL') ?? '',
			Deno.env.get('SUPABASE_ANON_KEY') ?? '',
			// Create client with Auth context of the user that called the function.
			// This way your row-level-security (RLS) policies are applied.
			//{ global: { headers: { Authorization: req.headers.get('Authorization')! } } }
		);
		// Now we can get the session or user object

		const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${Deno.env.get('PRIVATE_OPENAI_KEY')}`
			},
			body: JSON.stringify({
				model: 'text-embedding-ada-002',
				input: userQuestion.content
			})
		});
		const embeddingJson = await embeddingResponse.json();


		const embedding = embeddingJson.data[0].embedding;

		const { data, error } = await supabaseClient.rpc('match_documents', {
			query_embedding: embedding,
			similarity_threshold: 0.6,
			match_count: 2,
			condo_id: condo_id
		});
		if (error) throw error;

		const completion = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${Deno.env.get('PRIVATE_OPENAI_KEY')}`
			},
			body: JSON.stringify({
				model: 'gpt-3.5-turbo',
				stream: true,
				messages: [
					{
						role: 'system',
						content:
							"Eres un asistente que contesta preguntas sobre un condominio en específico ubicado en el Estado de México, y por tanto está apegado a la ley general de condominios. El usuario le va a proporcionar un fragmento de texto en forma de 'pregunta-respuesta' entre 3 comillas simples. Con ayuda de este fragmento contesta la pregunta del usuario sobre el condominio. Si la pregunta del usuario no está relacionada con condominios, contesta 'No puedo contestar eso'. Sé lo más conciso posible y evita decir frases como 'según el fragmento'"
					},
					...messages,
					{
						role: 'user',
						content: `'''${data
							.map((embedding: { content: string }) => embedding.content)
							.join(' ')}'''`
					}
				]
			})
		});
		console.log(completion);
		return new Response(completion.body, {
			headers: { ...corsHeaders, 'Content-Type': 'text/stream' },
			status: 200
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			status: 400
		});
	}
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'

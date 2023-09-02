// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

console.log('Hello from Functions!');

serve(async (req) => {
	const request = await req.json();
  const messages = request.messageFeed;

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? '',
    Deno.env.get("SUPABASE_ANON_KEY") ?? '',
  )

  

	const completion = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${Deno.env.get("PRIVATE_OPENAI_KEY")}`
		},
		body: JSON.stringify({
			model: 'gpt-3.5-turbo',
			user: session.user.id,
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
					content: `'''${data.map((embedding: { content: any }) => embedding.content).join(' ')}'''`
				}
			]
		})
	});

  const body = new ReadableStream({
    start(controller){
      for await(const chunk of completion){
        controller.enqueue(chunk.choices[0]?.delta?.content || ''):
      }
      controller.close();
    }
  });
	return new Response(body, { headers: { 'Content-Type': 'text/event-stream' } });
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'

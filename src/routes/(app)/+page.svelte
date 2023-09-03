<script lang="ts">
	
	import { onMount } from 'svelte/internal';
	import { enhance } from '$app/forms';

	import samAvatar from "$lib/static/avatars/sam_avatar.svg";
	import vivookAvatar from "$lib/static/avatars/vivook_avatar.png";

	import { PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	// DocShell
	// Components
	import { Avatar, ListBox, ListBoxItem, localStorageStore } from '@skeletonlabs/skeleton';

	import type { Writable } from 'svelte/store';

	export let data;
	let { session, supabase, condo_id } = data;
	$: ({ session, supabase, condo_id} = data);
	
	const userInitialsStore: Writable<string> = localStorageStore('userInitials', '');
	const userCondoStore: Writable<string> = localStorageStore('userCondo', '');
	const userNameStore: Writable<string> = localStorageStore("userName", '');

	let inputPrompt: HTMLTextAreaElement;
	// Types
	interface Person {
		id: number;
		avatar: string;
		name: string;
	}
	interface MessageFeed {
		id: number;
		host: boolean;
		avatar: number;
		name: string;
		timestamp: string;
		message: string;
		color: string;
	}
	interface ChatMessageFeed {
		role: "user" | "assistant",
		content: string
	};

	let elemChat: HTMLElement;

	// Navigation List
	const people: Person[] = [
		{ id: 0, avatar: samAvatar, name: 'Asistente Gicondo'}
	];
	let currentPerson: Person = people[0];

	// Messages
	let messageFeed: MessageFeed[] = [
		{
			id: 0,
			host: false,
			avatar: 48,
			name: 'Asistente Gicondo',
			timestamp: `Hoy @ ${getCurrentTimestamp()}`,
			message: `Buen día, ${$userNameStore}. Estoy aquí para responder sus dudas con respecto a la ${$userCondoStore}. Puedo resolver y cuestiones dudas relacionadas a la ley general de condominios, reglamentos, pagos, y otra información relevante de su condominio.`,
			color: 'variant-soft-primary'
		},
	];

	// GTP Messages
	let messageGptFeed: ChatMessageFeed[] = [
		{
			role: "assistant",
			content: `Buen día, ${$userNameStore}. Estoy aquí para responder sus dudas con respecto a la ${$userCondoStore}. Puedo resolver y cuestiones dudas relacionadas a la ley general de condominios, reglamentos, pagos, y otra información relevante de su condominio.`
		}
	]

	let canSendMessage = true;
	let currentMessage = '';
	let currentAssistantMessage = '';

	// For some reason, eslint thinks ScrollBehavior is undefined...
	// eslint-disable-next-line no-undef
	function scrollChatBottom(behavior?: ScrollBehavior): void {
		elemChat.scrollTo({ top: elemChat.scrollHeight, behavior });
	}

	function getCurrentTimestamp(): string {
		return new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
	}

	async function addMessage() {
		currentAssistantMessage = "";
		const newMessage = {
			id: messageFeed.length,
			host: true,
			avatar: 48,
			name: `${$userNameStore}`,
			timestamp: `Hoy @ ${getCurrentTimestamp()}`,
			message: currentMessage,
			color: 'variant-soft-primary'
		};
		const userMessage = {
			role: "user",
			content: currentMessage
		} as const
		// Update the message feed
		messageFeed = [...messageFeed, newMessage];

		// Update Chat  message feed 
		messageGptFeed = [...messageGptFeed, userMessage ];

		currentMessage = '';
		/* const { data, error } = await supabase.functions.invoke("post-message", {
			body: JSON.stringify({
				messageFeed: messageGptFeed, 
				condo_id: condo_id
			}),
		});

		console.log(data); */

		const response = await fetch("https://htxxmgiojpvqhunicmdq.supabase.co/functions/v1/post-message", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${PUBLIC_SUPABASE_ANON_KEY}`
			},
			mode: "cors",
			body: JSON.stringify({
				messageFeed: messageGptFeed, 
				condo_id: condo_id
			})
		})
		console.log(response);
	

		let assistantMessageBubble = {
			id: messageFeed.length,
			host: false,
			avatar: 48,
			name: "Asistente Gicondo",
			timestamp: `Hoy @ ${getCurrentTimestamp()}`,
			message: currentAssistantMessage,
			color: "variant-soft-primary"
		}

		messageFeed = [...messageFeed, assistantMessageBubble];

		setTimeout(() => {
			scrollChatBottom('smooth');
		}, 0);
		
		if(!response.body) return;

		const reader = response.body.getReader();

		while(true){
			const { done, value } = await reader.read(); 

			if(done) break;

			const chunkText = new TextDecoder().decode(value);

			let matches = [];
			let match;
			
			const regex = /"content"\s*:\s*"((?:[^"\\]|\\.)*)"/g;

			while ((match = regex.exec(chunkText))) {
			  const contentValue = match[1].replace(/\\"/g, '"');
			  matches.push(contentValue);
			}

			currentAssistantMessage += matches.join("");

			assistantMessageBubble.message = currentAssistantMessage;
			messageFeed.pop();

			messageFeed = [...messageFeed, assistantMessageBubble ];
			setTimeout(() => {
				scrollChatBottom('smooth');
			}, 0);
		}
		canSendMessage = true; 	
	}

	function onPromptKeydown(event: KeyboardEvent): void {
		if (['Enter'].includes(event.code)) {
			event.preventDefault();
			if(currentMessage.length !== 0 && canSendMessage ){
				addMessage();
			}
		}
	}
	function autoGrow(){

		if(!currentMessage){
			inputPrompt.rows = 1;
			return;
		}
		inputPrompt.style.height = (inputPrompt.scrollHeight) + "px";
	}

	// When DOM mounted, scroll to bottom
	onMount(() => {
		scrollChatBottom();
	});
</script>

<section class="card h-full max-h-full">
	<div class="chat w-full h-full grid grid-cols-1 lg:grid-cols-[30%_1fr]">
		<!-- Navigation -->
		<div class="hidden lg:grid grid-rows-[auto_1fr_auto] border-r border-surface-500/30">
			<!-- Header -->
			<!-- List -->
			<div class="p-4 space-y-4 overflow-y-auto">
				<small class="opacity-50">Nuestros servicios</small>
				<ListBox active="variant-filled-primary">
					{#each people as person}
						<ListBoxItem bind:group={currentPerson} name="people" value={person}>
							<svelte:fragment slot="lead">
								<Avatar src={person.avatar} initials={"AG"} width="w-8" />
							</svelte:fragment>
							{person.name}
						</ListBoxItem>
					{/each}
				</ListBox>
				<nav class="list-nav">
					<!-- (optionally you can provide a label here) -->
					<ul>
						<li>
							<a href="https://webapp.vivook.com/Login.php" target="_blank" rel="noopener">
								<span class=""><Avatar src={vivookAvatar} width="w-8"/></span>
								<span class="flex-auto">Vivook</span>
							</a>
						</li>
						<!-- ... -->
					</ul>
				</nav>
			</div>
			<!-- Footer -->
			<!-- <footer class="border-t border-surface-500/30 p-4">(footer)</footer> -->
		</div>
		<!-- Chat -->
		<div class="flex flex-col justify-between">
			<!-- Conversation -->
			<section bind:this={elemChat} style="max-height: calc(100vh - 171px);" class="p-4 overflow-y-auto space-y-4">
				{#each messageFeed as bubble}
					{#if bubble.host === true}
						<div class="grid grid-cols-[auto_1fr] gap-2">
							<Avatar initials={$userInitialsStore} width="w-12" />
							<div class="card p-4 variant-soft rounded-tl-none space-y-2">
								<header class="flex justify-between items-center">
									<p class="font-bold">{bubble.name}</p>
									<small class="opacity-50">{bubble.timestamp}</small>
								</header>
								<p>{bubble.message}</p>
							</div>
						</div>
					{:else}
						<div class="grid grid-cols-[1fr_auto] gap-2">
							<div class="card p-4 rounded-tr-none space-y-2 {bubble.color}">
								<header class="flex justify-between items-center">
									<p class="font-bold">{bubble.name}</p>
									<small class="opacity-50">{bubble.timestamp}</small>
								</header>
								<p>{bubble.message}</p>
							</div>
							<Avatar src={samAvatar} width="w-12" />
						</div>
					{/if}
				{/each}
				
			</section>
			<!-- Prompt -->
			<section class="border-t border-surface-500/30 p-4">
				<form action="?" method="post" use:enhance>
					<div class="input-group input-group-divider grid-cols-[auto_1fr_auto] rounded-container-token">
						<span></span>
						<textarea
							bind:this={inputPrompt}
							bind:value={currentMessage}
							class="bg-transparent border-0 ring-0"
							name="prompt"
							id="prompt"
							placeholder="Escribe una pregunta..."
							rows="1"
							on:keydown={onPromptKeydown}
							on:input={autoGrow}
						/>
						<button type="submit" class={currentMessage ? 'variant-filled-primary' : 'input-group-shim'} on:click={addMessage} disabled={currentMessage.length === 0 || !canSendMessage}>
							<span class="material-icons">send</span>
						</button>
					</div>
				</form>
			</section>
		</div>
	</div>
</section>

<style>
	#prompt {
		resize: none;
		max-height: 200px;
	}
</style>
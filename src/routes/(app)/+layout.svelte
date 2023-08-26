<script lang='ts'>
	// The ordering of these imports is critical to your app working properly
	import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	// Most of your app wide CSS should be put in this file
	import '../../app.postcss';
	import gicondoLogo from "$lib/static/logos/gicondo_logo.svg";
	import favicon from "$lib/static/logos/favicon.png";

	import { AppShell, AppBar, Avatar, popup, storePopup, localStorageStore } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';

	import type { PopupSettings } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	import { get, type Writable } from 'svelte/store';

	export let data;
    $: ({ supabase, session} = data);

	const userInitialsStore: Writable<string> = localStorageStore('userInitials', '');
	const userCondoStore: Writable<string> = localStorageStore('userCondo', '');
	const userNameStore: Writable<string> = localStorageStore("userName", '');

	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	const popupClickProfile: PopupSettings = {
		event: 'click',
		target: 'popupClickProfile',
		placement: 'left'
	};

	async function getLocalInfo(){
		if(get(userInitialsStore) && get(userCondoStore) && get(userNameStore)) return;

		const { data , error } = await supabase.from("UserInformation").select("first_name, last_name, Condominiums(name)");
		console.log(data);
		const { first_name, last_name } = data ? data[0] : {first_name: "", last_name: ""};

		const condoName = data ? data[0].Condominiums?.name : "";

		const userInitials = (first_name?.at(0) ?? "") + (last_name?.at(0) ?? "");
	

		userInitialsStore.set(userInitials);
		userCondoStore.set(condoName ?? "");
		userNameStore.set(first_name ?? "");
	}

	onMount(async() => {
		await getLocalInfo();
	})
</script>

<svelte:head>
	<!-- Material Icons -->
	<link rel="icon" href={favicon} />
	<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
</svelte:head>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<img class="h-12" src={gicondoLogo} alt="Logo de Gicondo">
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<div use:popup={popupClickProfile}>
					<Avatar 
						initials={$userInitialsStore}
						width="w-16"
						border="border-4 border-surface-300-600-token hover:!border-primary-500"
						cursor="cursor-pointer"
					/>
				</div>
				<div class="card p-4 w-72 shadow-xl" data-popup="popupClickProfile">
					<nav class="list-nav">
						<!-- (optionally you can provide a label here) -->
						<ul>
							<li>
								<a href="/auth/logout">
									<span class="material-icons">
										logout
									</span>
									<span class="flex-auto">Cerrar sesión</span>
								</a>
							</li>
							<!-- ... -->
						</ul>
					</nav>
					<div class="arrow bg-surface-100-800-token" />
				</div>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>

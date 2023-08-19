<script lang='ts'>
	// The ordering of these imports is critical to your app working properly
	import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	// Most of your app wide CSS should be put in this file
	import '../../app.postcss';
	import { AppShell, AppBar, Avatar, popup, storePopup } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';

	import type { PopupSettings } from '@skeletonlabs/skeleton';

	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	const popupClickProfile: PopupSettings = {
		event: 'click',
		target: 'popupClickProfile',
		placement: 'left'
	};
</script>

<svelte:head>
	<!-- Material Icons -->
	<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
</svelte:head>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<strong class="text-xl uppercase">Gicondo</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<div use:popup={popupClickProfile}>
					<Avatar 
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

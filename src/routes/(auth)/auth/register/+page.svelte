<script lang="ts">
	export let form;

	import gicondoLogo from "$lib/static/logos/gicondo_logo.svg";
</script>

<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<img
			class="mx-auto h-16 w-auto"
			src={gicondoLogo}
			alt="Your Company"
		/>
		<h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
			Iniciar sesión con su cuenta
		</h2>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
		<form class="space-y-6" action="#" method="POST">
			<div>
				<label for="email" class="block text-sm font-medium leading-6 text-gray-900"
					>Correo electrónico</label
				>
				<div class="mt-2">
					<input
						id="email"
						name="email"
						value={form ? form?.email : ''}
						type="email"
						autocomplete="email"
						required
						class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
					/>
				</div>
			</div>
            <div>
				<label for="password" class="block text-sm font-medium leading-6 text-gray-900"
					>Crear una contraseña</label
				>
				<div class="mt-2">
					<input
						id="password"
						name="password"
						value={form ? form?.email : ''}
						type="password"
						autocomplete="new-password"
						required
						class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
					/>
				</div>
			</div>
            <div>
				<label for="email" class="block text-sm font-medium leading-6 text-gray-900"
					>Confirmar su contraseña</label
				>
				<div class="mt-2">
					<input
						id="confirm-password"
						name="email"
						value={form ? form?.email : ''}
						type="password"
						required
						class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
					/>
				</div>
			</div>
			<div>
				<button
					type="submit"
					class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					>Registrarse</button
				>
			</div>
		</form>

		<p class="mt-10 text-center text-sm text-gray-500">
			¿Ya cuenta con una cuenta?
			<a href="/auth/login" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
				>Iniciar sesión aquí</a
			>
		</p>
	</div>
</div>

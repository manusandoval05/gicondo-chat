<script lang="ts">

    export let data;

    let {session, supabase, condominiums} = data;

    $: ({ session, supabase} = data);
</script>

<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <form action="?" method="post">
            <div class="card p-5 flex flex-col gap-5">
                <label class="label">
                    <span>Nombre</span>
                    <input required name="first_name" class="input" type="text" placeholder="Nombre" />
                </label>
                <label class="label">
                    <span>Apellido</span>
                    <input required name="last_name" class="input" type="text" placeholder="Apellido" />
                </label>
                
                <hr class="!border-t-2" />
                <label class="label">
                    <span>Seleccionar condominio</span>
                    <select required name="condominium" class="select">
                        <option value="">Seleccionar condominio</option>
                        {#each condominiums as condo}
                            <option value={condo.id}>{condo.name}</option>
                        {/each}
                    </select>
                </label>
                <label class="label">
                    <span>Departamento</span>
                    <input required name="department" class="input" type="text" placeholder="#104" />
                </label>
    
                <button type="submit" class="btn variant-filled-primary">Guardar</button>
            </div>
        </form>
    </div>
</div>
import { createClient } from '@supabase/supabase-js';

import { PUBLIC_LOCAL_SUPABASE_URL } from '$env/static/public';
import { PRIVATE_LOCAL_SUPABASE_SERVICE_KEY } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async({locals: {getSession}}) => {
    const session = await getSession();

    if(!session) throw redirect(303, "/auth/login");
}

export const actions = {
    default: async ({ request, locals: { getSession } }) =>{
        const formData = await request.formData();
        const formObject = Object.fromEntries(formData);

        const session = await getSession();

        if(!session) throw redirect(303, "/auth/login");

        const queryObject = { user_id: session?.user.id, ...formObject};

        const serviceSupabase = createClient(
            PUBLIC_LOCAL_SUPABASE_URL,
            PRIVATE_LOCAL_SUPABASE_SERVICE_KEY
        );

        const { data, error } = await serviceSupabase.from("UserInformation").upsert(queryObject);

        console.log(data, error);

        throw redirect(303, "/");
    }
};
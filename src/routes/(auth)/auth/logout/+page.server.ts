import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, locals: {getSession, supabase } }) => {
    const session = await getSession();

    if(!session) throw redirect(303, "/auth/login");

    supabase.auth.signOut();

    throw redirect(303, "/auth/login");

    return { url: url.origin };
}
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async({ url, locals: { getSession, supabase } }) => {

    const session = await getSession();
    if(!session) throw redirect(303, "auth/login");

    const { data, error } = await supabase.from("UserInformation").select("*");

    if(!data || data.length === 0) throw redirect(303, "/settings");
}
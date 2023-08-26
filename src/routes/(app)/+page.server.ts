import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async({ url, locals: { getSession, supabase } }) => {
    console.log("Trying to enter main page");
    const user = await supabase.auth.getUser();
    const session = await getSession();
    console.log(session);
    if(!session) throw redirect(303, "auth/login");

    const { data, error } = await supabase.from("UserInformation").select("*");

    if(!data || data.length === 0) throw redirect(303, "/settings");
}
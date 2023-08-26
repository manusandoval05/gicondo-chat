import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async({ locals: { supabase, getSession}}) => {

    const session = await getSession();

    if(!session) throw redirect(303, "/auth/login");

    const { data, error } = await supabase.from("UserInformation").select("user_type");


    if(data && data[0].user_type !== 2) throw redirect(303, "/");
}
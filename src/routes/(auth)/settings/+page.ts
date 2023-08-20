import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent }) => {
    const { supabase } = await parent();
    
    const { data, error } = await supabase.from("Condominiums").select("*");

    return { condominiums: data ? data : []};
}
export const load = async({ parent }) => {
    const { supabase, session } = await parent();

    const { data, error } = await supabase.from("UserInformation").select("condominium");

    // 4 is the general condo rules id
    return { condo_id: data ? data[0].condominium :  4 };
} 
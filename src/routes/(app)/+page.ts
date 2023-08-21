import type { PageLoad } from "./$types";

export const load: PageLoad = async({ parent }) =>{
    const { supabase } = await parent();

    const { data, error } = await supabase.from("UserInformation").select("first_name, last_name, Condominiums(name)");

    console.log(data, error);
    if(!error){
        return { userName: data[0].first_name, lastName: data[0].last_name, condominium: data[0].Condominiums.name};
    }

}
import type { Provider } from '@supabase/supabase-js';
import { fail, redirect } from '@sveltejs/kit';


export const actions = {
    login: async({ request, locals: { getSession, supabase} }) => {
        const formData = await request.formData();

        const email = formData.get("email")?.toString();
        const password = formData.get("password")?.toString();

        if(!email && !password){
            return {
                email: false, 
                password: false,
            }
        }
        if(!email){
            return { email: null}
        }
        if(!password){
            return { password: null}
        }

        const { data, error} = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if(!error) throw redirect(303, "/");

        return {
            email: email,
            password: password,
            message: "Invalid login credentials"
        }
    },
    social_login: async({ locals: { supabase }, url }) => {
        const provider = url.searchParams.get("provider") as Provider;

        if(!provider) return {
            provider: false
        }
    
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: `${url.origin}/auth/callback`,
            }
        });
        if(error) return fail(400, {
            message: "Algo salió mal"
        });

        throw redirect(303, data.url);
    }
}
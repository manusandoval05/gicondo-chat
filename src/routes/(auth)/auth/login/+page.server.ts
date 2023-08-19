import { redirect } from '@sveltejs/kit';

export const actions = {
    default: async({ request, locals: { getSession, supabase} }) => {
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
    }
}
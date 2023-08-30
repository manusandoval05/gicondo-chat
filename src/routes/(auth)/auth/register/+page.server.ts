import { redirect } from '@sveltejs/kit';

export const actions = {
    default: async({ request, locals: { supabase, getSession }}) =>{

        const formData = Object.fromEntries(await request.formData());

        if (formData.password !== formData.confirm_password ) return { email: formData.email, passwords_match: false }

        const { data, error } = await supabase.auth.signUp({
            email: formData.email as string,
            password: formData.password as string
        }); 

        throw redirect(303, "/auth/register/confirm-email");
    }
}
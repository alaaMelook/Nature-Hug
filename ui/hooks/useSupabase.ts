import {supabase} from "@/data/datasources/supabase/client";
import {CustomerRepo} from "@/domain/repositories/customerRepository";

export const useSupabase = () => {

    const getSession = async () => {
        const {
            data: {
                session
            }
        } = await supabase.auth.getSession();
        const {access_token, refresh_token}: any = session
        console.log(session)
        await setSession(access_token, refresh_token);
        return session
    }

    const setSession = async (access_token: string, refresh_token: string) => {
        const {data, error} = await supabase.auth.setSession({
            access_token,
            refresh_token
        });
        return true
    }
    const getUser = async () => {
        const {
            data: {
                user
            }
        } = await supabase.auth.getUser();
        if (user) {
            let customer = await CustomerRepo.fetchCustomer(user.id);

            return customer;
        }
    }
    const getMember = async () => {
        const customer = await getUser();
        if (customer) {
            let member = await CustomerRepo.fetchMember(customer.id);

            return member;
        }
    }
    const signInWithGoogle = async () => {
        const {error} = await CustomerRepo.signInWithGoogle();
        if (error) alert(error);
    };

    const signInWithEmail = (email: string, password: string) => CustomerRepo.signInWithEmail(email, password);
    const signUpWithEmail = (email: string, password: string, name?: string) => CustomerRepo.signUpWithEmail(email, password, name);
    const signOut = async () => {
        await CustomerRepo.signOut();
    };

    return {
        setSession,
        getSession,
        getUser,
        getMember,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,

    }
}
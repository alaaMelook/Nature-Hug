import {supabase} from "@/data/datasources/supabase/client";
import {ICustomerClientRepository} from "@/data/repositories/client/iCustomerRepository";
import {useState} from "react";
import {Customer} from "@/domain/entities/auth/customer";

const CustomerRepoClient = new ICustomerClientRepository();

export const useSupabase = () => {
    const [user, setUser] = useState<Customer | null>()
    const getSession = async () => {
        const session = await CustomerRepoClient.getSession();
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
        if (data.session) return true
        if (error) return false
        return false
    }
    const getUser = async () => {
        const user = await CustomerRepoClient.getCurrentUser();
        if (user) {
            const userNew = await CustomerRepoClient.fetchCustomer(user.id);
            setUser(userNew)
            return userNew;
        }
    }
    const getMember = async () => {
        const customer = await getUser();
        if (customer) {
            return await CustomerRepoClient.fetchMember(customer.id);
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return {
        setSession,
        getSession,
        getUser,
        user,
        getMember,
        signOut,

    }
}
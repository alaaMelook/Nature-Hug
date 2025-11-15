import {Login} from "@/domain/use-case/shipments/login";

export async function useLoginAction() {
    return await new Login().execute();

}

import {SignupScreen} from "@/ui/client-screens/(store)/signup-screen";
import {GetCurrentUser} from "@/domain/use-case/shop/getCurrentUser";
import {redirect} from "next/navigation";

export default async function SignupPage() {
    const user = await new GetCurrentUser().execute();
    if (user) {
        redirect('/profile')
    }

    return (
        <SignupScreen/>
    );
}
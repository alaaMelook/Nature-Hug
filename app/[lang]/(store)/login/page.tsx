import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";
import { redirect, RedirectType } from "next/navigation";
import { LoginScreen } from "@/ui/client-screens/(store)/login-screen";

export default async function LoginPage() {
    const user = await new GetCurrentUser().execute();
    if (user) {
        redirect('/profile', RedirectType.replace)
    }
    return (
        <LoginScreen />
    );
}

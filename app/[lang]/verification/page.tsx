import {cookies} from "next/headers";
import VerifyScreen from "@/ui/client-screens/(store)/verify-screen";

export default async function VerifyPage() {
    const email = (await cookies()).get('email')?.value;
    return (
        <VerifyScreen email={email ?? ''}/>
    )
}

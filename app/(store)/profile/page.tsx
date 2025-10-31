import {ViewProfile} from "@/domain/use-case/shop/viewProfile";
import {ProfileScreen} from "@/ui/client-screens/(store)/profile-screen";
import {redirect} from "next/navigation";
import {GetAllGovernorates} from "@/domain/use-case/shop/getAllGovernorates";

export default async function ProfilePage() {
    const profile = await new ViewProfile().execute();
    if (!profile) {
        redirect('/login');
    }
    const governorates = await new GetAllGovernorates().execute();
    return (
        <ProfileScreen profile={profile} governorates={governorates}/>
    );
}

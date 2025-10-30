import {ViewProfile} from "@/domain/use-case/shop/viewProfile";
import {ProfileScreen} from "@/ui/client-screens/(store)/profile-screen";
import {redirect} from "next/navigation";

export default function ProfilePage() {
    const profile = new ViewProfile().execute();
    if (!profile) {
        redirect('/login');
    }
    return (
        <ProfileScreen initialProfile={profile}/>
    );
}

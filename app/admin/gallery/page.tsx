import { GetAllImages } from "@/domain/use-case/admin/images";
import { GalleryScreen } from "@/ui/client-screens/admin/gallery-screen";

export default async function GalleryPage() {

    const images = await new GetAllImages().execute()

    return (
        <GalleryScreen images={images} />
    );
}

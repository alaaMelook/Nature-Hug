import { ThemesScreen } from "@/ui/client-screens/admin/themes-screen";
import { ThemesRepository } from "@/data/repositories/server/iThemesRepository";

export default async function ThemesPage() {
    const themesRepo = new ThemesRepository();
    const themes = await themesRepo.getAll();
    return (<ThemesScreen initialThemes={themes} />);
}

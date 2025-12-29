import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";
import EmployeesScreen from "@/ui/client-screens/admin/employees-screen";

export default async function EmployeesPage() {
    const user = await new GetCurrentUser().execute();

    return (
        <EmployeesScreen currentUserId={user?.id} />
    );
}

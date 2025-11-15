import { GetAllCustomers } from "@/domain/use-case/admin/getAllCustomers";
import { CustomersScreen } from "@/ui/client-screens/admin/customers-screen";

export default async function CustomersPage() {

  const customers = await new GetAllCustomers().execute({ withoutMembers: false });
  return <CustomersScreen allCustomers={customers} />;
}

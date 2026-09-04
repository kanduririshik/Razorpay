import { redirect } from "next/navigation";

export default function CustomersRedirect() {
  redirect("/admin/customers");
}

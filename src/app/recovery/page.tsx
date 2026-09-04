import { redirect } from "next/navigation";

export default function RecoveryRedirect() {
  redirect("/admin/recovery");
}

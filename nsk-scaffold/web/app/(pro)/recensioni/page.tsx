import { redirect } from "next/navigation";

// "Recensioni" è confluita nella tab omonima dentro CRM.
export default function RecensioniRedirectPage() {
  redirect("/crm");
}

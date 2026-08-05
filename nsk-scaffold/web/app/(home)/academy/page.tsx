import { redirect } from "next/navigation";

// Il catalogo corsi è confluito nel tab "Corsi" di /tutor-ai (hub di
// apprendimento unico). Redirect per chi ha ancora questo link salvato —
// stesso pattern usato per le voci consolidate in N'sK Pro.
export default function AcademyIndexRedirect() {
  redirect("/tutor-ai");
}

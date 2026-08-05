import { redirect } from "next/navigation";

// "Ingredienti" è confluita nella tab omonima dentro Food Cost — redirect per
// non rompere eventuali link/segnalibri esistenti verso questa route.
export default function IngredientiRedirectPage() {
  redirect("/food-cost");
}

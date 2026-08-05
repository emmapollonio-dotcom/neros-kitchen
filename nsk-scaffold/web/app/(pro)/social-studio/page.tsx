import { redirect } from "next/navigation";

// "Social Studio" è confluita nella tab omonima dentro Analytics.
export default function SocialStudioRedirectPage() {
  redirect("/analytics");
}

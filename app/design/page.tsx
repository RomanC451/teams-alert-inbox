import { redirect } from "next/navigation";

export default function DesignRedirectPage() {
  redirect("/home#designs");
}

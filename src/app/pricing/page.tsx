import { redirect } from "next/navigation";
// /pricing no longer exists — redirect to products
export default function PricingPage() {
  redirect("/products");
}

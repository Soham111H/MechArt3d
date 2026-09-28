import { redirect } from "next/navigation";

// /resources → redirect to first service or show a brief overview
export default function ResourcesPage() {
  redirect("/resources/new-product-development");
}

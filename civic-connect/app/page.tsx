import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/guard";
import { ROLE_HOME } from "@/lib/dto";

export default async function Home() {
  const user = await getCurrentUser();
  redirect(user ? ROLE_HOME[user.role] : "/login");
}

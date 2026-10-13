import { redirect } from "next/navigation";

// The app starts at sign in. Public tracking stays reachable at /track.
export default function Home() {
  redirect("/login");
}
